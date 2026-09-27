// src/animations/scrollController.js — GSAP ScrollTrigger timelines driving the three.js
// camera + Vega EVX model transforms. Data-driven keyframe map keeps HTML sections and
// camera poses in sync: add a section with data-camera="poseName" and a matching key here.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera/model keyframe map. Each pose corresponds to a <section data-camera="...">
 * inside the hero scroll container on the Home page.
 */
export const CAMERA_KEYFRAMES = {
  intro:   { pos: [0, 1.4, 7.5],  look: [0, 0.6, 0],    rotY: -0.6 },
  front:   { pos: [0, 1.0, 5.2],  look: [0, 0.55, 0],   rotY: 0 },
  side:    { pos: [5.6, 1.1, 0.8],look: [0, 0.55, 0],   rotY: -Math.PI / 2 },
  rear:    { pos: [-0.6, 1.6, -5.4], look: [0, 0.6, 0], rotY: Math.PI },
  wheel:   { pos: [3.1, 0.5, 2.2], look: [2.2, 0.35, 1.4], rotY: -1.1 },
  cockpit: { pos: [0.4, 1.0, 1.2], look: [0, 0.7, -0.4], rotY: 0.2 },
  outro:   { pos: [0, 2.6, 8.6],  look: [0, 0.5, 0],    rotY: 0.5 },
};

/**
 * Attach a scrubbed timeline that interpolates camera position/lookAt and model rotation
 * across every [data-camera] section in order. Call once after the scene is ready.
 *
 * @param {THREE.Camera} camera        – perspective camera used by the render loop
 * @param {THREE.Object3D} model       – the loaded Vega EVX group (rotated for cinematic sweep)
 * @param {HTMLElement} scrollerEl     – element containing the data-camera sections
 * @param {object} opts                – { reducedMotion:boolean }
 * @returns {gsap.core.Timeline|null}  – timeline (null when reduced motion disables it)
 */
export function attachScrollTimeline(camera, model, scrollerEl, opts = {}) {
  if (opts.reducedMotion || !camera || !scrollerEl) return null;

  const sections = Array.from(scrollerEl.querySelectorAll('[data-camera]'));
  if (!sections.length) return null;

  // Mutable proxies so GSAP can tween plain numbers/vectors without touching React
  const state = {
    cam: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    look: { x: 0, y: 0.6, z: 0 },
    rotY: model ? model.rotation.y : 0,
  };

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      trigger: scrollerEl,
      start: 'top top',
      end: () => '+=' + (sections.length * window.innerHeight), // one viewport per pose
      scrub: 1,           // 1s smoothing -> buttery scroll-linked motion
      pin: false,
      invalidateOnRefresh: true,
    },
  });

  sections.forEach((section, i) => {
    const pose = CAMERA_KEYFRAMES[section.dataset.camera];
    if (!pose) return;
    const label = `pose-${section.dataset.camera}`;
    tl.addLabel(label, i); // keyframe index = section order
    tl.to(state.cam, { x: pose.pos[0], y: pose.pos[1], z: pose.pos[2] }, i);
    tl.to(state.look, { x: pose.look[0], y: pose.look[1], z: pose.look[2] }, i);
    if (model) tl.to(state, { rotY: pose.rotY }, i);
  });

  // Apply interpolated state each GSAP tick (GSAP.ticker shares rAF with the render loop)
  const apply = () => {
    camera.position.set(state.cam.x, state.cam.y, state.cam.z);
    camera.lookAt(state.look.x, state.look.y, state.look.z);
    if (model) model.rotation.y = state.rotY;
  };
  gsap.ticker.add(apply);

  // Reveal copy sections as they enter (staggered fade/slide)
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      }
    );
  });

  return () => {
    gsap.ticker.remove(apply);
    tl.scrollTrigger && tl.scrollTrigger.kill();
    tl.kill();
  };
}

/** Jump the scroll position to the section bound to a named camera pose (POI links). */
export function scrollToPose(poseName) {
  const el = document.querySelector(`[data-camera="${poseName}"]`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
