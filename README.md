# Rock & Roll Underground 2027

A single-page cinematic sponsor deck for **Rock & Roll Underground 2027** — the most
exciting event at NRF 2027, live at The Cutting Room, New York.

Built as one continuous, smooth-scrolling experience:

1. **Concert hero** — a pinned, scroll-scrubbed stage sequence (date, venue, band + crowd).
2. **Audience interstitial → Sponsor Benefits finale** — a 3D Monster-can revolution over
   carbonation bubbles.
3. **"Feel the Rush"** — a falling-can sky-dive beat with 3D gold headline words.
4. **Sponsor tiers** — a tabbed "Amplify Your Impact" closer (Marquis / Title / Supporting)
   with an alternating copy layout and a sliding 3D can.

## Tech

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://github.com/pmndrs/drei) for the 3D
- [GSAP](https://gsap.com/) + ScrollTrigger, synced to [Lenis](https://lenis.darkroom.engineering/) smooth scroll
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server (Turbopack) |
| `npm run build` | Production build                |
| `npm run start` | Serve the production build      |
| `npm run lint`  | Lint                            |
