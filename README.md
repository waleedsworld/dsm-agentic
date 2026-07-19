<div align="center">

<img src="public/dsm-white.png" alt="DSM — Digital Software Market" width="180" />

# DSM — Digital Software Market

### The luxury concierge for genuine software licences.

Microsoft, Adobe, Autodesk & friends — browsed in 3D, sorted by an AI concierge,
and delivered instantly. No dodgy keys, no buyer's remorse, just licences done right.

<br/>

[![Live](https://img.shields.io/badge/live-digitalsoftwaremarket.ai-e11d2f?style=for-the-badge)](https://digitalsoftwaremarket.ai)
&nbsp;
![React](https://img.shields.io/badge/React-18-1f2937?style=for-the-badge&logo=react)
&nbsp;
![Vite](https://img.shields.io/badge/Vite-5-1f2937?style=for-the-badge&logo=vite)
&nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-strict-1f2937?style=for-the-badge&logo=typescript)

<br/>

![DSM in action](docs/media/demo.gif)

<sub>A real capture — animated wireframe hero, the 3D licence shelf, and the concierge, live.</sub>

</div>

---

## What is this thing?

**DSM** is a premium storefront for legitimate software licensing. Think of it as the
boutique of software keys — every product sits on the shelf as a spinnable **3D box**,
an **AI concierge** helps you find the right SKU by chatting, and the whole thing is
wrapped in a moody, crimson-on-charcoal design that takes itself just seriously enough.

It's a single-page app (React + Vite + TypeScript) with a storefront, product modals,
a cart, a checkout flow, and a marketing surface — plus a built-in offline catalogue so
it runs beautifully even when there's no backend in sight.

> **Fun fact:** every product card renders a real `.glb` model with `@google/model-viewer`,
> so the "boxes" actually catch the light as you scroll. It's shelf appeal, literally.

## Feature reel

- **A licence shelf, 347 deep** — Microsoft, Adobe, Autodesk, Chaos, SketchUp, Kaspersky and more.
- **3D product boxes** — every card is a lazily-loaded, self-rotating GL model (**381 bundled**).
  They catch light, cast shadows, and spin on hover — no screenshots, actual geometry.
- **AI concierge** — a floating chat that understands "I need Office for 3 machines" and
  navigates the store for you (falls back to a local matcher when offline).
- **Smart filters & sort** — by brand, category, licence type, price and popularity, with
  both grid and list layouts.
- **Cart → checkout flow** — the whole shopping journey, client-side and snappy.
- **Offline-first catalogue** — no backend? No problem. DSM serves a bundled catalogue so
  the grid is never empty. If a live API is reachable it uses it; if it vanishes mid-session,
  DSM degrades gracefully instead of going dark. Covered by a **Vitest** suite.
- **Light & dark, done right** — a proper theme switch (crimson glows either way), remembered
  across visits.
- **Fully responsive** — from a 27" monitor down to a phone in your pocket.

## Two faces, one build (the A/B toggle)

DSM ships **two live experiences from the same bundle**, switched from the on-page settings
panel (bottom-left cog) — no rebuild, no flag file, no redeploy:

| Variant | What you get | Best for |
| --- | --- | --- |
| **A — Full storefront** *(default)* | The complete boutique: hero, editorial spotlights, 3D grid, cart, checkout | Shoppers & showcasing |
| **B — Concierge kiosk** | Marketing mode off → the chrome melts away and you're left with a full-screen AI concierge | Kiosks, embeds, "just help me pick" |

Flip **Marketing Mode** off and the entire site collapses into the assistant; flip it back on
and the boutique returns. Same preferences, same catalogue, two very different front doors.

## Gallery

| Home — dark | Home — light |
| :---: | :---: |
| ![Home dark](docs/media/home.png) | ![Home light](docs/media/home-light.png) |

| The 3D licence shelf | Cart |
| :---: | :---: |
| ![Store](docs/media/store.png) | ![Cart](docs/media/cart.png) |

<div align="center">

| Mobile home | Mobile store |
| :---: | :---: |
| <img src="docs/media/mobile-home.png" width="240" alt="DSM home on mobile" /> | <img src="docs/media/mobile-store.png" width="240" alt="DSM store on mobile" /> |

</div>

## Quick start (yes, even if you've never touched React)

You'll need **Node.js 18+** and **npm**. Don't have them? Grab Node with
[nvm](https://github.com/nvm-sh/nvm#installing-and-updating) — it's the friendliest way.

```sh
# 1. Clone the shop
git clone https://github.com/waleedsworld/dsm-agentic.git
cd dsm-agentic

# 2. Install the goods
npm install

# 3. Open the doors (hot-reload dev server)
npm run dev
```

Now visit **http://localhost:8080** and you're in. 🎉

That's the whole ritual. On first load with no backend running, DSM quietly falls back to
its bundled catalogue, so you'll see real products and 3D boxes straight away.

### Build for production

```sh
npm run build      # bundles into dist/
npm run preview    # serve the production build locally to sanity-check it
```

### The rest of the toolbox

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot module reload (port 8080) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint over the project |
| `npm run test` | Run the Vitest suite |
| `npm run test:watch` | Run tests in watch mode |

## Connecting a live backend (optional)

Out of the box DSM runs on its offline catalogue. To wire it to a real DSM API for live
inventory, pricing, and the full AI concierge, point it at your backend:

```sh
# .env
VITE_API_BASE=https://your-dsm-backend.example.com
```

If the backend is unreachable at runtime, DSM automatically degrades to the bundled
catalogue and logs a friendly note in the console — the storefront never goes dark.

## Under the hood

| Layer | Tech |
| --- | --- |
| Build tool | **Vite 5** (`@vitejs/plugin-react-swc`) |
| UI | **React 18** + **TypeScript** |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix primitives) |
| 3D | **three.js** + **@google/model-viewer** |
| Data/state | **React Query**, a lightweight `AppContext` |
| Routing | **react-router-dom** |
| Tests | **Vitest** + **Testing Library** |

Project shape:

```
src/
├── components/     # Header, Hero, ProductCard, GlobalAIChat, ModelViewer, SettingsPanel…
├── contexts/       # AppContext — cart, filters, marketing mode, theme
├── data/           # bundled catalogue + 3D model index
├── lib/
│   ├── api.ts             # backend client with automatic offline fallback
│   └── staticCatalogue.ts # normalises the bundled catalogue into full products
├── pages/          # Index, Storefront, Cart, Checkout, Marketing, NotFound
└── test/           # Vitest suites
public/
└── models/         # 381 .glb product models
```

## Live demo

**Live at [digitalsoftwaremarket.ai](https://digitalsoftwaremarket.ai).** ✨
Go spin a few boxes and ask the concierge for something impossible.

## License

Product names, logos and trademarks (Microsoft, Adobe, Autodesk, and others) belong to
their respective owners; DSM is a reseller storefront and is not affiliated with or
endorsed by those vendors. The application code in this repository is the author's own work.

<div align="center">
<br/>
Made with a lot of crimson and a little caffeine. ☕
</div>
