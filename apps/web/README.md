# `apps/web` — Marketing landing page

Next.js 16 (Turbopack). **Marketing only.** The functional app lives in
`apps/mobile` and is served on this site at `/app/*` via the Expo web export.

See `WEB_SETUP.md` at the repo root for the full architecture.

## Run

```bash
# From repo root:
npm run mobile:export    # build /app once (Expo -> public/app/)
npm run web              # next dev on :3000
```

Or from this directory:

```bash
npm run dev
```

`/app` will 404 in dev until `mobile:export` has run at least once.

## Build

```bash
# From repo root (this is what CI runs):
npm run web:build
```

Equivalent to: `mobile:export` then `next build`.

## What's in `src/`

- `app/page.tsx` — the landing page (FloatingFoodHero + CinematicHero).
- `app/layout.tsx` — root layout, fonts (Inter + Fraunces).
- `app/globals.css` — design tokens as CSS variables. Mirror of `packages/ui/src/tokens/color.ts`.
- `components/open-app-button.tsx` — CTA that calls `smartAppLink.openApp()`.
- `components/ui/*` — marketing components only. NO functional app code here.
- `lib/smartAppLink.ts` — platform detection + routing (desktop → `/app`, mobile → store).

## Rules

See `AGENTS.md` in this directory. Short version: never import `react-native`,
`expo-*`, or `@unsung/ui` (it bundles RN primitives). Use `globals.css` CSS
variables for colors, `lucide-react` for icons.
