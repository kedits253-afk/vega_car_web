// src/pages/Download.jsx — Download page: links to the packaged site zip + asset checklist.
import React from 'react';

export default function Download() {
  return (
    <section className="page download-page" aria-labelledby="download-title">
      <div className="container narrow">
        <h1 id="download-title">Download the Website Bundle</h1>
        <p className="lede">
          Get the complete static build of this site as a single zip — ready for Netlify, Vercel,
          GitHub Pages, or any web server. Unzip and open <code>index.html</code> (or upload the
          folder contents to your host).
        </p>

        <div className="card download-card">
          <a
            className="btn btn-primary download-btn"
            href="./release/vega-evx-site.zip"   // copy pack.js output into public/release/ or host it
            download="vega-evx-site.zip"
          >
            ⬇ Download vega-evx-site.zip
          </a>
          <p className="small">
            Build it yourself: run <code>npm install && npm run package</code> — the bundle is
            written to <code>release/vega-evx-site.zip</code>.
          </p>
        </div>

        <article className="card">
          <h2>Included in the bundle</h2>
          <ul>
            <li>Production build (<code>dist/</code>: HTML, JS, CSS, images)</li>
            <li>Vega EVX 3D model placeholder + Draco decoder files</li>
            <li><code>README.md</code> with hosting + licensing instructions</li>
          </ul>
          <h2>Required original assets to place before packaging</h2>
          <ul>
            <li><code>public/models/vega-evx.glb</code> — Draco-compressed hero model (~150k tris target)</li>
            <li><code>public/models/vega-evx.low.glb</code> — decimated LOD (~40k tris) for mobile</li>
            <li><code>public/images/vega-evx-hero.jpg</code> / <code>.webp</code> — fallback posters</li>
            <li><code>public/draco/</code> — draco decoder (copy from <code>node_modules/three/examples/jsm/libs/draco/</code>)</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
