// src/components/Footer.jsx — Common footer with legal links + asset-rights notice.
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Vega EVX Fan Showcase — unofficial demo site.</p>
        <nav aria-label="Legal">
          <ul>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </nav>
        <p className="attribution small">
          “Vega” and “EVX” are trademarks of their respective owner. Confirm rights before
          production use of branding, imagery and the 3D model (see README → Asset Licensing).
        </p>
      </div>
    </footer>
  );
}
