// src/pages/Model.jsx — Interactive orbit viewer with POI annotation buttons.
import React, { useState } from 'react';
import ThreeScene from '../components/ThreeScene.jsx';
import useCapability from '../hooks/useCapability.js';
import { POIS } from '../data/specs.js';

export default function Model() {
  const cap = useCapability();
  const [activePoi, setActivePoi] = useState(null);
  const [status, setStatus] = useState('Loading 3D model…');

  return (
    <section className="page model-page" aria-labelledby="model-title">
      <div className="container">
        <h1 id="model-title">Interactive Model Viewer</h1>
        <p className="lede">Drag to orbit, scroll/pinch to zoom. Use the annotation buttons to jump to key features.</p>

        <div className="viewer-grid">
          <div className="viewer-wrap">
            <ThreeScene
              mode="orbit"
              reducedMotion={cap.reducedMotion}
              webglAvailable={cap.webgl}
              lowPower={cap.lowPower}
              pois={POIS}
              activePoi={activePoi}
              onReady={() => setStatus('Model ready. Orbit with mouse/touch or Tab through annotations.')}
              onError={() => setStatus('3D unavailable — showing photo fallback.')}
            />
            <p className="sr-only" role="status" aria-live="polite">{status}</p>
          </div>

          <aside className="poi-panel card" aria-label="Points of interest">
            <h2>Annotations</h2>
            <ul className="poi-list">
              {POIS.map((poi) => (
                <li key={poi.id}>
                  <button
                    type="button"
                    className={activePoi === poi.id ? 'poi-btn active' : 'poi-btn'}
                    onClick={() => setActivePoi(poi.id)}
                    aria-pressed={activePoi === poi.id}
                  >
                    {poi.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="small">
              Keyboard: focus a button and press Enter to fly the camera to that feature.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
