// src/main.jsx — App entry point. Registers GSAP plugins once, mounts React root.
// Uses HashRouter so the unzipped static bundle works from file:// and any sub-path host.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import App from './App.jsx';
import './styles/global.css';

// Register GSAP plugins globally (idempotent)
gsap.registerPlugin(ScrollTrigger);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
