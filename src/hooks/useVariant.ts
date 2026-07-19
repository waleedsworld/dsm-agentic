import { useEffect, useState } from "react";

/**
 * A/B variant toggle driven by the `?variant=` query string.
 *
 * Usage: append `?variant=b` to any URL to opt into the "b" experience.
 * Anything other than `b` (including no param) resolves to the default `a`.
 *
 * The value is resolved once on mount from `window.location.search`, then
 * kept in sync if the history entry changes (back/forward, pushState) so a
 * client-side navigation that swaps the query string flips the variant too.
 */
export type Variant = "a" | "b";

function readVariant(): Variant {
  if (typeof window === "undefined") return "a";
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("variant") || "").toLowerCase();
  return raw === "b" ? "b" : "a";
}

export function useVariant(): Variant {
  const [variant, setVariant] = useState<Variant>(readVariant);

  useEffect(() => {
    const sync = () => setVariant(readVariant());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return variant;
}

export default useVariant;
