# Unsung Bites — Mobile App

Single Expo codebase that ships to **iOS + Android + Web**.

## Run

```bash
# from monorepo root
npm install
npm run mobile         # opens Expo Dev Tools — press i / a / w
npm run mobile:web     # straight to browser
```

## Structure

```
app/                   # Expo Router — file = route
  (onboarding)/        # Splash + permissions
  (tabs)/              # Bottom-tab nav: Home, History, Scan, Profile
  restaurant/[id].tsx  # Editorial detail
  achievement/[id].tsx # Badge unlocked

components/
  primitives/          # Text, Card, Button, Screen
  restaurant/          # RestaurantCard, VibeTag, HiddenGemBadge
  camera/              # Vignette, HolographicBrackets
  gamification/        # Badge, StreakFlame
  map/                 # FauxMap (provider-agnostic placeholder)

theme/tokens.ts        # Single source of truth: colors, radii, fonts, shadows
tailwind.config.js     # Mirrors tokens for Tailwind utility classes

lib/
  api/                 # ONE client per service — swap body to go live
  mock/                # JSON copies of services/*/mock/* (Metro can bundle)
  ranking/             # hiddenGemScore.ts — your formula goes here
  gamification/        # badges.ts — your unlock rules go here
```

## Loose coupling

Every screen calls `@/lib/api` only. Each `lib/api/*.ts` reads from a JSON mock today. To go live: replace the function bodies with `fetch(...)`. Screens don't change.

## Two files asking for your input

- `lib/ranking/hiddenGemScore.ts` — define what "hidden gem" means to you
- `lib/gamification/badges.ts` — define unlock criteria for 3–5 starter badges
