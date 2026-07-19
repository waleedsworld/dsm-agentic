import { useVariant } from "@/hooks/useVariant";
import Hero from "./Hero";
import HeroB from "./HeroB";

/**
 * Renders the hero A/B variant selected by the `?variant=` query string.
 * Default (`?variant=a` or absent) → the original centered hero.
 * `?variant=b` → the benefit-led split hero (HeroB).
 */
const HeroSwitch = () => {
  const variant = useVariant();
  return variant === "b" ? <HeroB /> : <Hero />;
};

export default HeroSwitch;
