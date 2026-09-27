// src/pages/Home.jsx — Hero + scroll-driven 3D reveal. Fixed canvas behind scrolling copy
// sections; each section's data-camera attribute maps to a keyframe in scrollController.js.
import React, { useRef } from 'react';
import ThreeScene from '../components/ThreeScene.jsx';
import useCapability from '../hooks/useCapability.js';
import { HERO_COPY } from '../data/specs.js';

const SECTIONS = [
  { pose: 'intro',   title: 'Welcome aboard the EVX', body: 'A cinematic, scroll-driven tour of Vega’s electric performance SUV. Keep scrolling — you control the camera.' },
  { pose: 'front',   title: 'Signature front fascia', body: 'Full-width LED light bar, active aero intakes and a sculpted bonnet define the EVX face.' },
  { pose: 'side',    title: 'Sculpted for efficiency', body: 'A flush-sided silhouette with a panoramic glass roof keeps drag low and cabin light high.' },
  { pose: 'rear',    title: 'Presence from behind', body: 'The rear light signature mirrors the front, framing a generous cargo deck under the tailgate.' },
  { pose: 'wheel',   title: 'Aero-forged wheels', body: 'Large-diameter forged wheels with aero inserts balance range and road presence.' },
  { pose: 'cockpit', title: 'Tech-first cockpit',     body: 'A rotating portrait display, digital cluster and head-up display put information where you need it.' },
  { pose: 'outro',   title: 'Ready to explore more?', body: 'Open the interactive Model viewer, read the full spec sheet, or take the Quiz Me challenge.' },
];

export default function Home() {
  const cap = useCapability();
  const scrollerRef = useRef(null);

  return (
    <>
      {/* Fixed WebGL layer sits behind the scrolling content */}
      <div className="hero-canvas-layer" aria-hidden={cap.reducedMotion || !cap.webgl}>
        <ThreeScene
          mode="scroll"
          scrollerEl={scrollerRef.current}
          reducedMotion={cap.reducedMotion}
          webglAvailable={cap.webgl}
          lowPower={cap.lowPower}
        />
      </div>

      <div className="home-scroll" ref={scrollerRef}>
        {/* Hero headline */}
        <section className="hero-section" data-camera="intro" aria-labelledby="hero-title">
          <p className="eyebrow reveal">{HERO_COPY.eyebrow}</p>
          <h1 id="hero-title" className="reveal">{HERO_COPY.title}</h1>
          <p className="lede reveal">{HERO_COPY.subtitle}</p>
          <p className="scroll-hint reveal" aria-hidden="true">▼ scroll ▼</p>
        </section>

        {SECTIONS.slice(1).map((s) => (
          <section key={s.pose} className="copy-section" data-camera={s.pose}>
            <article className="card reveal">
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </article>
          </section>
        ))}

        {/* Reduced-motion / no-WebGL users get static imagery per pose instead */}
        {(cap.reducedMotion || !cap.webgl) && (
          <section className="copy-section">
            <figure className="card reveal">
              <img src="./images/vega-evx-hero.jpg" alt="Vega EVX studio shot" width="1600" height="900" loading="lazy" />
              <figcaption>Vega EVX — static view (motion reduced or 3D unavailable).</figcaption>
            </figure>
          </section>
        )}
      </div>
    </>
  );
}
