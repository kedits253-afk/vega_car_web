// src/pages/Privacy.jsx — Placeholder privacy page (replace with counsel-reviewed text).
import React from 'react';

export default function Privacy() {
  return (
    <section className="page legal-page" aria-labelledby="privacy-title">
      <div className="container narrow">
        <h1 id="privacy-title">Privacy Policy</h1>
        <p><em>Template only — replace with your counsel-reviewed policy before launch.</em></p>
        <h2>Data we store</h2>
        <p>This site stores quiz progress locally in your browser (localStorage) and nothing else.
           No personal data is transmitted to any server by default.</p>
        <h2>Analytics</h2>
        <p>If analytics are enabled, they should be cookie-consented and anonymised. Document the
           provider, data retained, and opt-out here.</p>
        <h3>Contact</h3>
        <p>privacy@example.com</p>
      </div>
    </section>
  );
}
