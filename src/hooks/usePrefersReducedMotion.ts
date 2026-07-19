import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reactively reports whether the user has requested reduced motion at the OS
 * level. Used to disable non-essential animation (three.js hero mesh, model
 * auto-rotation, etc.) for users who are sensitive to motion, and to avoid
 * shipping/booting heavy animation work when it isn't wanted.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setPrefersReduced(mql.matches);
    onChange();
    // addEventListener is the modern API; guard for older Safari.
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return prefersReduced;
}

export default usePrefersReducedMotion;
