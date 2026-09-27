// src/components/Header.jsx — Sticky nav with keyboard-accessible mobile menu.
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/model', label: 'Model' },
  { to: '/specs', label: 'Specs' },
  { to: '/quiz', label: 'Quiz Me' },
  { to: '/download', label: 'Download' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <nav aria-label="Primary" className="nav-inner">
        <NavLink to="/" className="brand" aria-label="Vega EVX home">
          <span className="brand-mark" aria-hidden="true">⚡</span> VEGA&nbsp;EVX
        </NavLink>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true">☰</span>
        </button>

        <ul id="primary-menu" className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
