// src/pages/Terms.jsx — Placeholder terms page + trademark/attribution notice.
import React from 'react';

export default function Terms() {
  return (
    <section className="page legal-page" aria-labelledby="terms-title">
      <div className="container narrow">
        <h1 id="terms-title">Terms of Use</h1>
        <p><em>Template only — replace with counsel-reviewed terms before launch.</em></p>
        <h2>Trademark & asset rights</h2>
        <p>
          “Vega” and “EVX” are trademarks of their respective owner. This project is an unofficial
          technical demo. Before production deployment you must: (1) obtain written permission to
          use the Vega name, logo and marketing imagery; (2) license or self-create the 3D model at
          <code> public/models/vega-evx.glb</code>; (3) verify all specification figures.
        </p>
        <h2>Content accuracy</h2>
        <p>All specifications shown on this site may be speculative and are marked as such. They do
           not constitute manufacturer data.</p>
      </div>
    </section>
  );
}
