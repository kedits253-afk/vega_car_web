// vite.config.js — Vite + React, static-friendly base path.
// Set `base` to '/vega-evx-site/' (or your repo name) when deploying to GitHub Pages sub-paths.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths so the dist zip works when unzipped anywhere & on any host
  build: {
    target: 'es2018',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split heavy 3D libs into their own cacheable chunk
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
