# Vega EVX — Interactive 3D Website

Multi-page static site (React + Vite + three.js + GSAP ScrollTrigger) showcasing the **Vega EVX**
electric SUV with a scroll-driven cinematic 3D tour, an orbit model viewer with annotations, a
spec sheet, an interactive "Quiz Me" page, and an automated zip packaging pipeline.

## Quick start (copy-paste)

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # preview the built dist/ locally
npm run package      # build + zip -> release/vega-evx-site.zip
unzip -l release/vega-evx-site.zip   # inspect bundle (Windows: expand-archive)
```

## Project structure

```
vega-evx-site/
├─ index.html                  # SEO meta, OG/Twitter cards, JSON-LD, no-JS fallback
├─ package.json                # deps + scripts (dev/build/preview/package)
├─ vite.config.js              # React plugin, relative base, manual chunks for three/gsap
├─ pack.js                     # Node script: build then zip dist/ via archiver
├─ public/                     # static assets copied verbatim into dist/
│  ├─ models/vega-evx.glb      # Draco-compressed hero model (see Asset pipeline)
│  ├─ models/vega-evx.low.glb  # decimated LOD for low-power devices
│  ├─ draco/                   # draco decoder (copy node_modules/three/examples/jsm/libs/draco/*)
│  ├─ images/                  # vega-evx-hero.jpg/.webp posters, og-vega-evx.jpg, favicon.svg
│  └─ release/                 # optional: drop prebuilt zip here so /download can link it
├─ src/
│  ├─ main.jsx                 # entry; registers GSAP ScrollTrigger, HashRouter
│  ├─ App.jsx                  # layout shell + lazy routes (Home/Model/Specs/Quiz/Download/legal)
│  ├─ styles/global.css        # design system: dark hero, white cards, responsive grid/flex
│  ├─ hooks/useCapability.js   # WebGL detect, prefers-reduced-motion, low-power heuristic
│  ├─ animations/scrollController.js  # camera keyframe map + scrubbed GSAP timeline
│  ├─ components/
│  │  ├─ ThreeScene.jsx        # GLTFLoader+DRACOLoader, orbit mode, POIs, preloader, fallbacks
│  │  ├─ Header.jsx            # sticky nav, accessible mobile menu
│  │  └─ Footer.jsx            # legal links + trademark notice
│  ├─ pages/                   # Home, Model, Specs, Quiz, Download, Privacy, Terms
│  └─ data/
│     ├─ quiz.json             # 6 sample questions w/ answers + explanations
│     └─ specs.js              # spec groups (all values SPECULATIVE placeholders), POIs, hero copy
└─ release/                    # output of `npm run package`
```

## Required original assets & where to place them

| Asset | Path | Notes |
|---|---|---|
| Hero 3D model | `public/models/vega-evx.glb` | glTF-Binary, Draco compressed, ~100–150k tris target |
| Low LOD | `public/models/vega-evx.low.glb` | ~30–50k tris, auto-selected on low-power devices |
| Draco decoder | `public/draco/` | `cp -r node_modules/three/examples/jsm/libs/draco/* public/draco/` |
| Fallback posters | `public/images/vega-evx-hero.jpg` (+ `.webp`) | ≤200 KB each, 1600×900 |
| Social card | `public/images/og-vega-evx.jpg` | 1200×630 |

Placeholder set: if you have no model yet, any Draco GLB renamed `vega-evx.glb` works; the site
degrades to poster images when the file is missing (fallback chain in `ThreeScene.jsx`).

## Asset pipeline — Blender → Draco GLB

1. Model/import the EVX (units: metres; car ≈ 4.75 m long). Apply modifiers; origin at ground centre.
2. Target polycounts: **High ≤150k tris**, **Low LOD ≤50k** (Decimate modifier 0.3–0.4).
3. Textures: 2K PBR max (BaseColor/Roughness/Metalness/Normals); KTX2/Basis optional for extra compression.
4. Export: `File → Export → glTF 2.0 (.glb)` → Format *glTF Binary*, enable mesh compression,
   Position quantization/skip normals as appropriate (or use CLI below).
5. CLI alternative (gltf-pipeline):
   ```bash
   npm i -g gltf-pipeline
   gltf-pipeline -i vega-evx.gltf -o vega-evx.glb -d          # -d = Draco compress
   gltf-pipeline -i vega-evx.glb -o vega-evx.draco.glb \
     --draco.compressionLevel 7 --draco.quantizePositionBits 14
   ```
6. Verify: drag the .glb into https://gltf-viewer.donmccurdy.com/

## Performance budgets & targets

- Critical payload (no 3D assets): **< 1 MB** (vendor+app JS ≈ 200 KB gz, CSS ≈ 8 KB).
- Lighthouse: **Performance > 90, Accessibility > 90, Best Practices > 95, SEO > 95**.
- TTI < 2 s on mid-range mobile (best-effort); LCP element = hero headline/poster image.
- GLB budget: high ≤ 4 MB, low ≤ 1.5 MB (Draco + texture downscale).
- Techniques: lazy route chunks, deferred model load, pixelRatio clamp 2 (1 on low-power),
  antialias/shadows off on low-power, `manualChunks` split for three/gsap caching.

## Accessibility checklist (implemented)

- Skip link, semantic landmarks (`header/nav/main/footer`), one `h1` per page.
- All interactive controls are real `<button>`s; visible `:focus-visible` outlines.
- Quiz results dialog uses `role="dialog" aria-modal` with programmatic focus.
- Progress bars expose `role="progressbar"` + `aria-valuenow`; live regions announce feedback.
- `prefers-reduced-motion`: disables the scrubbed camera timeline & shows static sections/posters.
- Canvas has `role="img"` + aria-label; POI buttons provide keyboard access to camera moves.
- Contrast: body text ≥ 4.5:1 on both dark hero and white cards.

## Hosting

- **Netlify**: drag-and-drop `dist/`, or build settings: cmd `npm run build`, publish `dist`.
- **Vercel**: framework preset *Vite*; output auto-detected (`dist`).
- **GitHub Pages**: set `base: '/<repo-name>/'` in `vite.config.js`, then:
  ```bash
  npm run build && npx gh-pages -d dist
  ```
  (HashRouter already keeps deep links working without server rewrites.)
- **Any static host / unzipped bundle**: unzip `release/vega-evx-site.zip` and upload contents.

## QA checklist (final pass)

1. [ ] Desktop Chrome/Firefox/Edge/Safari + iOS Safari + Android Chrome — 3D renders, no console errors.
2. [ ] Responsive at 375 / 768 / 1024 / 1440 px; header collapses to hamburger < 760 px.
3. [ ] Keyboard-only walkthrough: skip link → nav → quiz options → results dialog → close/reset.
4. [ ] Screen reader (VoiceOver/NVDA): headings order, ARIA live announcements on quiz feedback.
5. [ ] `prefers-reduced-motion: reduce` — no scroll animation, static content readable.
6. [ ] WebGL disabled (force software off / old device) — poster fallback shown.
7. [ ] Quiz resume after refresh (localStorage) and reset button clears state.
8. [ ] Share link round-trip: copy link → new tab → correct score rendered.
9. [ ] SEO: title/description/OG image validate via opengraph.xyz; JSON-LD parses in Rich Results Test.
10. [ ] All images have alt text; Lighthouse a11y > 90.
11. [ ] Bundle check: `npm run build` — no chunk > 700 KB warning; critical JS < 1 MB w/o 3D assets.
12. [ ] LCP measured (< 2.5 s desktop, < 3 s throttled mobile) via Lighthouse/devtools performance tab.
13. [ ] Analytics triggers (if added) fire on route change and respect consent banner.
14. [ ] `npm run package` produces `release/vega-evx-site.zip`; unzip → serve folder → all pages work.
15. [ ] Trademark/licensing sign-off recorded (see Terms page + note below).

## Asset licensing note

This is an **unofficial demo**. Before production use you must confirm rights to the "Vega"/"EVX"
names, logos, photography and the 3D model. If official assets are unavailable, create original
modeling/photography or obtain a written license. All spec figures in this repo are clearly marked
as speculative placeholders — replace with homologated manufacturer data.
