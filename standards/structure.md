# Project Structure

```
resturant/
├── apps/
│   └── mobile/                          # Expo: builds iOS + Android + Web from one codebase
│       ├── app/                         # Expo Router screens
│       │   ├── _layout.tsx              # Root: fonts, providers, stack
│       │   ├── index.tsx                # Entry redirect
│       │   ├── (onboarding)/splash.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx            # Home feed (canonical animation reference)
│       │   │   ├── history.tsx
│       │   │   ├── scan.tsx
│       │   │   ├── profile.tsx
│       │   │   └── restaurant/[id].tsx
│       │   └── achievement/[id].tsx
│       ├── components/                  # APP-LOCAL feature components only
│       │   ├── restaurant/              # RestaurantCard, HiddenGemBadge, VibeTag
│       │   ├── gamification/            # Badge, StreakFlame
│       │   ├── camera/                  # HolographicBrackets, Vignette
│       │   ├── map/                     # FauxMap
│       │   └── timeline/
│       ├── hooks/                       # useReduceMotion (accessibility)
│       └── lib/                         # api/, gamification/, mock/, ranking/, store/
│
├── packages/
│   ├── ui/                              # ← THE STANDARD. Shared design system.
│   │   └── src/
│   │       ├── tokens/                  # color, space, radius, typography, shadow, motion
│   │       ├── primitives/              # Text, Button, Card, Screen — zero business logic
│   │       └── index.ts                 # public surface — only this is importable
│   │
│   └── contracts/                       # Shared TS types (RestaurantSummary, etc.)
│
├── services/                            # Mock service implementations
└── standards/                           # Project-wide conventions
    ├── animations.md
    ├── libraries.md
    ├── structure.md
    └── tokens.md
```

## Rules

- **Tokens & primitives live in `packages/ui`.** Add once → every target (iOS/Android/Web) gets it.
- **Import from `@unsung/ui`, never deep paths.** Not `@unsung/ui/src/primitives/Button`.
- **No hardcoded design values in app code** — colors, spacing, radii, fonts, springs, durations all come from `@unsung/ui`.
- **Primitives have zero business logic and zero API calls.** If a component knows what a "restaurant" is, it belongs in `apps/mobile/components/<domain>/`.
- **Screens import from `@/lib/api` only** — never reach directly into `lib/api/discovery.ts`.
- **One spring per role.** Use `spring.gentle / snappy / bouncy` from `@unsung/ui`. Don't invent per-component values.

## Adding to the standard

Adding a new primitive (e.g., `Sheet`, `Toast`):

1. Create `packages/ui/src/primitives/Sheet.tsx`
2. Export from `packages/ui/src/index.ts`
3. Use it from any app via `import { Sheet } from '@unsung/ui'`

Adding a new token (e.g., a `warning` color):

1. Add to the relevant file under `packages/ui/src/tokens/`
2. Update `standards/tokens.md` table
3. It's immediately available everywhere

When in doubt: if it's used in more than one app or could be, it goes in `packages/ui`.

## Web error pages

The web app ships a reusable `<ErrorPage>`
(`apps/web/src/components/ui/error-page.tsx`) for any 404 / error route. To add a new
error surface, create the Next file-convention file and just render it:

```tsx
// apps/web/src/app/error.tsx  (or a route-segment not-found.tsx)
"use client";
import { ErrorPage } from "@/components/ui/error-page";

export default function Error() {
  return <ErrorPage code="500" title="Something broke" description="..." />;
}
```

The global 404 (`apps/web/src/app/not-found.tsx`) already does this. The OG/social image
is generated at build time by `apps/web/src/app/opengraph-image.tsx` (`next/og`) — no
static asset, no 404; add a sibling `opengraph-image.tsx` in any route folder to override
it per-route.
