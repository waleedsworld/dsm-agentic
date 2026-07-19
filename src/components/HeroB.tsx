import { useState } from "react";
import { ArrowRight, ArrowDown, ShieldCheck, Clock, BadgeCheck, Sparkles } from "lucide-react";
import { useHeroReveal, useCursorGlow } from "@/hooks/useScrollAnimation";
import MagnifyText from "./MagnifyText";
import HeroMesh from "./HeroMesh";
import type { MeshAccent } from "./HeroMesh";

/**
 * Hero variant "B" — activated via `?variant=b`.
 *
 * Distinct from the default hero in three ways the A/B test measures:
 *   1. Headline: benefit-led ("Software licenses, delivered in seconds")
 *      instead of the brand-name-led default.
 *   2. Layout: left-aligned split (copy left, credibility panel right) versus
 *      the default centered stack.
 *   3. CTA: a primary "Browse the Catalog" action paired with a pricing link,
 *      versus the default "Talk to a Specialist" concierge framing.
 */
const HeroB = () => {
  const ref = useHeroReveal();
  const { containerRef, glowRef } = useCursorGlow();
  const [meshAccent, setMeshAccent] = useState<MeshAccent>("azure");

  return (
    <section
      ref={containerRef}
      className="cursor-glow relative min-h-screen flex items-center pt-28 overflow-hidden bg-[#030305]"
    >
      {/* Three.js interactive mesh background (shared with variant A) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <HeroMesh accent={meshAccent} />
      </div>

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[45vw] h-[45vw] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(204 61% 51% / 0.08) 0%, transparent 70%)", animation: "orbFloat 14s ease-in-out infinite, orbColorAzure 10s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/5 right-1/4 w-[38vw] h-[38vw] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(43 87% 60% / 0.05) 0%, transparent 70%)", animation: "orbFloat 16s ease-in-out infinite reverse, orbColorGold 11s ease-in-out infinite" }}
        />
      </div>

      {/* Cursor spotlight */}
      <div ref={glowRef} className="cursor-glow-dot z-[2]" />

      <div
        ref={ref}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center"
      >
        {/* LEFT — copy + CTAs */}
        <div className="flex flex-col items-start text-left">
          {/* Eyebrow */}
          <div className="hero-reveal mb-8">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 border border-azure/40 bg-[#05070b]/70 rounded-full backdrop-blur-sm text-xs font-medium uppercase tracking-[0.12em] text-gold">
              <Sparkles className="w-3 h-3 text-azure" />
              Trusted by 12,000+ teams
            </span>
          </div>

          {/* Headline — benefit-led */}
          <h1 className="hero-reveal font-sans leading-[0.95] tracking-[0.01em] font-bold text-[#FEFEFE] mb-6" style={{ fontSize: "clamp(2rem, 5.2vw, 4.25rem)" }}>
            Software licenses,
            <br />
            <span className="text-azure">delivered in seconds.</span>
          </h1>

          {/* Subheadline */}
          <div className="hero-reveal text-base md:text-lg font-medium text-[#FEFEFE]/90 max-w-xl leading-relaxed mb-10 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
            <MagnifyText text="Skip the resellers you can't verify. Genuine keys, instant activation, and a warranty that outlasts the subscription." />
          </div>

          {/* CTAs — primary + pricing link */}
          <div className="hero-reveal flex flex-wrap items-center gap-6">
            <a
              href="/store"
              className="btn-magnetic px-10 py-4 bg-azure/[0.14] border border-azure/50 backdrop-blur-md text-azure text-xs font-semibold uppercase tracking-[0.18em] rounded-sm hover:bg-azure/[0.24] hover:shadow-azure-glow flex items-center justify-center gap-3 group transition-all duration-400"
              onMouseEnter={() => setMeshAccent("azure")}
              onMouseLeave={() => setMeshAccent("azure")}
            >
              Browse the Catalog
              <ArrowRight className="w-3.5 h-3.5 opacity-60 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#pricing"
              className="text-xs font-medium text-[#FEFEFE]/85 uppercase tracking-[0.14em] hover:text-gold flex items-center gap-1.5 group transition-colors duration-300"
            >
              See Pricing
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* RIGHT — credibility panel */}
        <div className="hero-reveal">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md p-7 flex flex-col gap-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B1B2B3]/70">
              Why buyers pick DSM
            </span>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-azure shrink-0" />
                <span className="text-sm text-[#FEFEFE]/90"><strong className="font-semibold text-[#FEFEFE]">100% genuine</strong> — vendor-verified keys, never gray market.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-azure shrink-0" />
                <span className="text-sm text-[#FEFEFE]/90"><strong className="font-semibold text-[#FEFEFE]">Instant delivery</strong> — activation details in your inbox in seconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <BadgeCheck className="w-4 h-4 mt-0.5 text-azure shrink-0" />
                <span className="text-sm text-[#FEFEFE]/90"><strong className="font-semibold text-[#FEFEFE]">Lifetime warranty</strong> — replacement or refund, no expiry.</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-[#FEFEFE]/70">
              <span className="w-1.5 h-1.5 bg-azure rounded-full animate-pulse" />
              Official Certified Reseller
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[10px] text-[#B1B2B3]/50 uppercase tracking-[0.2em]">Scroll</span>
        <ArrowDown className="w-4 h-4 text-azure/60 animate-bounce" strokeWidth={1.5} />
      </div>
    </section>
  );
};

export default HeroB;
