# Hero A/B Variant (`?variant=b`)

The landing hero ships in two variants, selected at runtime by the `variant`
query-string parameter. This lets marketing run an A/B test on the highest-value
piece of the storefront without a rebuild or a feature-flag service.

| | Variant **A** (default) | Variant **B** (`?variant=b`) |
|---|---|---|
| **URL** | `/` or `/?variant=a` | `/?variant=b` |
| **Headline** | Brand-led — `DIGITAL SOFTWARE MARKET` | Benefit-led — `Software licenses, delivered in seconds.` |
| **Layout** | Centered single-column stack | Left-aligned split: copy left, credibility panel right |
| **Primary CTA** | `Talk to a Specialist` (concierge framing) | `Browse the Catalog` → `/store` (self-serve framing) |
| **Secondary CTA** | `Shop Licenses` | `See Pricing` |
| **Accent** | Crimson/red mesh | Azure mesh + gold eyebrow |
| **Social proof** | Inline trust badges under CTAs | `Trusted by 12,000+ teams` eyebrow + 3-point panel |

Anything other than `b` (including a missing param) resolves to variant A, so the
default experience is unchanged for organic traffic.

## How it works

- `src/hooks/useVariant.ts` — reads `?variant=` from `window.location.search`,
  normalizes it to `"a" | "b"`, and re-reads on `popstate` so back/forward
  navigation flips the variant too.
- `src/components/HeroSwitch.tsx` — thin selector that renders `<Hero />` (A) or
  `<HeroB />` (B) based on the hook.
- `src/components/HeroB.tsx` — the variant-B hero. Reuses the shared
  `HeroMesh`, `MagnifyText`, `useHeroReveal`, and `useCursorGlow` primitives so
  the two variants share motion/background behavior and only diverge in copy,
  layout, and CTAs.
- `src/pages/Index.tsx` — swaps the direct `<Hero />` mount for `<HeroSwitch />`
  (the only edit to a shared file).

## Testing manually

```bash
npm run dev            # http://localhost:8080
# open http://localhost:8080/            -> variant A
# open http://localhost:8080/?variant=b  -> variant B
```

## Wiring a real experiment

To bucket traffic, assign a variant server-side (or via an edge redirect) and
append `?variant=b` to the URL for the B cohort, or set the param client-side
before first paint. The hook has no other dependencies, so any bucketing source
that lands the user on a `?variant=b` URL activates the B experience.
