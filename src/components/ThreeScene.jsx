// src/components/ThreeScene.jsx — Plain three.js scene (GLTFLoader + DRACOLoader) with a
// WebGL fallback poster, preloader progress, orbit mode and scroll-driven camera mode.
//
// ALTERNATIVE (react-three-fiber): if you prefer declarative 3D, add
//   npm i @react-three/fiber @react-three/drei
// and replace this file with:
//   <Canvas camera={{position:[0,1.4,7.5]}}>
//     <Suspense fallback={null}>
//       <useGLTF="/models/vega-evx.glb" />        // drei useGLTF w/ draco decoder path
//       <OrbitControls enableZoom enablePan={false} />
//     </Suspense>
//   </Canvas>
// The scrollController can then drive the R3F camera via useThree() in a tiny controller component.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { attachScrollTimeline, CAMERA_KEYFRAMES } from '../animations/scrollController.js';

const MODEL_URL = import.meta.env.VITE_MODEL_URL || './models/vega-evx.glb';
const DRACO_DECODER_PATH = './draco/'; // copy of three/examples/jsm/libs/draco/ in public/draco

export default function ThreeScene({
  mode = 'scroll',            // 'scroll' (Home, scrubbed timeline) | 'orbit' (Model page)
  scrollerEl = null,         // element containing [data-camera] sections (scroll mode)
  reducedMotion = false,
  webglAvailable = true,
  lowPower = false,
  onProgress = () => {},
  onReady = () => {},
  onError = () => {},
  pois = [],                 // [{ id, label, position:[x,y,z] }] annotation markers
  activePoi = null,          // POI id to fly camera to (orbit mode)
}) {
  const mountRef = useRef(null);
  const sceneApi = useRef(null); // imperative API shared with parent (flyTo etc.)
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleProgress = useCallback((e) => {
    const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
    setProgress(pct);
    onProgress(pct);
  }, [onProgress]);

  useEffect(() => {
    if (!webglAvailable || !mountRef.current) return;

    // ---- Renderer -------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: !lowPower,          // save GPU on low-power devices
      alpha: true,
      powerPreference: lowPower ? 'low-power' : 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 2));
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = !lowPower;
    mountRef.current.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D view of the Vega EVX');
    renderer.domElement.setAttribute('role', 'img');

    // ---- Scene & lights -------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f14, 0.03);

    const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x1a1d22, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 4);
    key.castShadow = !lowPower;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x88aaff, 1.4);
    rim.position.set(-5, 3, -6);
    scene.add(rim);

    // Simple studio ground disc (cheap, no texture download)
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(9, 48),
      new THREE.MeshStandardMaterial({ color: 0x11151b, roughness: 0.9, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !lowPower;
    scene.add(ground);

    // ---- Camera ---------------------------------------------------------
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    const intro = CAMERA_KEYFRAMES.intro;
    camera.position.set(...intro.pos);
    camera.lookAt(...intro.look);

    // ---- Model loading: GLTFLoader + DRACOLoader ------------------------
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH); // local wasm/js decoder (see README)
    dracoLoader.setDecoderConfig({ type: 'js' });   // 'wasm' is faster where supported

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    let model = null;
    let controls = null;
    let detachScroll = null;
    let rafId = null;
    let disposed = false;

    // LOD selection: high-poly for desktop, decimated variant when available on low power.
    const url = lowPower
      ? MODEL_URL.replace('.glb', '.low.glb') // ship vega-evx.low.glb; fall back below
      : MODEL_URL;

    gltfLoader.load(
      url,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = !lowPower;
            // Draco-compressed GLBs sometimes lose env intensity; nudge materials slightly
            if (o.material) {
              o.material.envMapIntensity = 0.8;
              o.material.needsUpdate = true;
            }
          }
        });
        scene.add(model);

        if (mode === 'orbit') {
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.08;
          controls.minDistance = 2.2;
          controls.maxDistance = 12;
          controls.maxPolarAngle = Math.PI / 2 - 0.03; // never go under the floor
          controls.target.set(0, 0.6, 0);
        } else {
          detachScroll = attachScrollTimeline(camera, model, scrollerEl, { reducedMotion });
        }

        // Annotation points-of-interest (small glowing spheres, keyboard-reachable via list UI)
        pois.forEach((poi) => {
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x4cc9f0 })
          );
          marker.position.set(...poi.position);
          marker.userData.poiId = poi.id;
          scene.add(marker);
        });

        onReady();
      },
      handleProgress,
      (err) => {
        // Fallback chain: try base model if .low variant missing, else show poster
        if (lowPower && String(err?.message || err).length) {
          gltfLoader.load(MODEL_URL, (gltf) => {
            if (disposed) return;
            model = gltf.scene;
            scene.add(model);
            if (mode === 'orbit') {
              controls = new OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.target.set(0, 0.6, 0);
            }
            onReady();
          }, handleProgress, () => { setFailed(true); onError(err); });
        } else {
          setFailed(true);
          onError(err);
        }
      }
    );

    // ---- Render loop (rAF; GSAP.ticker drives scroll state in parallel) --
    const clock = new THREE.Clock();
    const tick = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      if (model && mode === 'orbit' && !reducedMotion) {
        // gentle idle bob so the car feels alive while orbiting
        model.position.y = Math.sin(t * 0.8) * 0.005;
      }
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // ---- Resize ----------------------------------------------------------
    const onResize = () => {
      if (!mountRef.current) return;
      const { clientWidth: w, clientHeight: h } = mountRef.current;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Imperative API for POI navigation from page content
    sceneApi.current = {
      flyTo(poseName) {
        const pose = CAMERA_KEYFRAMES[poseName];
        if (!pose) return;
        if (controls) controls.enabled = false;
        gsapFly(camera, pose);
        function gsapFly(cam, p) {
          // Minimal tween without importing gsap here twice: reuse simple lerp over time
          const start = cam.position.clone();
          const end = new THREE.Vector3(...p.pos);
          const look = new THREE.Vector3(...p.look);
          let t0 = performance.now();
          const dur = 900;
          (function step(now) {
            const k = Math.min(1, (now - t0) / dur);
            const ease = 1 - Math.pow(1 - k, 3);
            cam.position.lerpVectors(start, end, ease);
            cam.lookAt(look);
            if (k < 1 && !disposed) requestAnimationFrame(step);
            else if (controls) controls.enabled = true, controls.target.copy(look);
          })(t0);
        }
      },
    };

    // ---- Cleanup ----------------------------------------------------------
    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
      if (detachScroll) detachScroll();
      if (controls) controls.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, webglAvailable, lowPower, reducedMotion]);

  // Fly to POI when the parent requests it (annotation links from content sections)
  useEffect(() => {
    if (activePoi && sceneApi.current) {
      const poi = pois.find((p) => p.id === activePoi);
      if (poi && poi.pose) sceneApi.current.flyTo(poi.pose);
    }
  }, [activePoi, pois]);

  // ---------- Fallbacks (no WebGL / load error / reduced-motion static) ----------
  if (!webglAvailable || failed) {
    return (
      <div className="scene-fallback">
        <img
          src="./images/vega-evx-hero.jpg"
          alt="Vega EVX electric SUV, front three-quarter studio shot"
          width="1600"
          height="900"
          loading="lazy"
        />
        <p className="fallback-note">
          Interactive 3D isn’t available on this device — showing a high-resolution photo instead.
        </p>
      </div>
    );
  }

  return (
    <div className="three-scene" ref={mountRef}>
      {progress < 100 && (
        <div className="preloader" role="status" aria-live="polite">
          <div className="preloader-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>Loading Vega EVX… {progress}%</p>
        </div>
      )}
    </div>
  );
}
