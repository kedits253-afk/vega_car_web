// src/data/specs.js — Vega EVX spec sheet data.
// ⚠️ ALL NUMBERS BELOW ARE SPECULATIVE / PLACEHOLDER. Replace with official, homologated
// figures from Vega before launch. Each entry carries a `speculative: true` flag which the
// Specs page renders as a visible "unverified" badge.
export const SPECS = [
  { group: 'Performance', items: [
    { label: '0–100 km/h', value: '< 4.0 s', speculative: true },
    { label: 'Top speed', value: '200 km/h (claimed)', speculative: true },
    { label: 'Drivetrain', value: 'Dual-motor AWD', speculative: true },
    { label: 'Power', value: '~350 kW combined', speculative: true },
  ]},
  { group: 'Battery & Range', items: [
    { label: 'Battery capacity', value: '~85 kWh', speculative: true },
    { label: 'Claimed range', value: '~550 km', speculative: true },
    { label: 'DC fast charge', value: '10→80% in ~60 min', speculative: true },
    { label: 'Cell chemistry', value: 'NMC (assumed)', speculative: true },
  ]},
  { group: 'Dimensions', items: [
    { label: 'Length', value: '4750 mm', speculative: true },
    { label: 'Width', value: '1920 mm', speculative: true },
    { label: 'Height', value: '1660 mm', speculative: true },
    { label: 'Wheelbase', value: '2900 mm', speculative: true },
    { label: 'Kerb weight', value: '~2200 kg', speculative: true },
  ]},
  { group: 'Features', items: [
    { label: 'Infotainment', value: '15.6" rotating portrait display', speculative: true },
    { label: 'Instrumentation', value: 'Digital cluster + HUD', speculative: true },
    { label: 'ADAS', value: 'Level 2 (targeted)', speculative: true },
    { label: 'OTA updates', value: 'Yes', speculative: true },
  ]},
];

export const HERO_COPY = {
  eyebrow: 'All-electric performance SUV',
  title: 'Vega EVX',
  subtitle: 'Scroll to drive through a cinematic 3D tour — every section moves the camera around the car.',
};

export const POIS = [
  { id: 'front-lightbar', label: 'Full-width LED light bar', pose: 'front',   position: [0, 0.95, 2.3] },
  { id: 'aero-wheel',     label: 'Aero-forged 21" wheels',   pose: 'wheel',   position: [2.2, 0.35, 1.4] },
  { id: 'pano-roof',      label: 'Panoramic glass roof',     pose: 'side',    position: [0, 1.55, 0] },
  { id: 'charge-port',    label: 'DC fast-charge port',      pose: 'rear',    position: [-1.9, 0.8, -1.6] },
  { id: 'cockpit',        label: 'Rotating 15.6" display',   pose: 'cockpit', position: [0, 0.9, -0.2] },
];
