// src/pages/Specs.jsx — Detailed spec sheet grouped by category. Speculative values are
// clearly badged; replace with official figures before launch.
import React from 'react';
import { SPECS } from '../data/specs.js';

export default function Specs() {
  return (
    <section className="page specs-page" aria-labelledby="specs-title">
      <div className="container">
        <h1 id="specs-title">Vega EVX — Specifications</h1>
        <p className="disclaimer card" role="note">
          ⚠️ Values marked <span className="badge">unverified</span> are speculative placeholders
          for demo purposes. Replace them with official homologated Vega specifications before launch.
        </p>

        <div className="specs-grid">
          {SPECS.map((group) => (
            <article key={group.group} className="card spec-card" aria-labelledby={`spec-${group.group}`}>
              <h2 id={`spec-${group.group}`}>{group.group}</h2>
              <dl>
                {group.items.map((item) => (
                  <React.Fragment key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>
                      {item.value}{' '}
                      {item.speculative && <span className="badge" title="Speculative placeholder value">unverified</span>}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
