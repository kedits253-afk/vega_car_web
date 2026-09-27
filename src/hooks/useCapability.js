// src/hooks/useCapability.js — Feature/capability detection for 3D fallbacks.
// Detects: WebGL support, prefers-reduced-motion, coarse pointer/small screen, deviceMemory hints.
import { useMemo } from 'react';

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function useCapability() {
  return useMemo(() => {
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const webgl = detectWebGL();
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    // navigator.deviceMemory is Chromium-only; treat missing as mid-range
    const lowPower = isMobile || (navigator.deviceMemory != null && navigator.deviceMemory <= 4);
    return {
      webgl,          // if false -> static hero image fallback everywhere
      reducedMotion,  // if true  -> disable scroll-driven camera timeline, show sections statically
      isMobile,
      lowPower,       // choose LOD-low / static poster
    };
  }, []);
}
