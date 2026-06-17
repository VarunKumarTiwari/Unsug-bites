# Project Structure

```
resturant/
├── apps/
│   └── mobile/
│       ├── app/                     # Expo Router screens
│       │   ├── _layout.tsx          # Root: fonts, providers, stack
│       │   ├── index.tsx            # Entry redirect
│       │   ├── (onboarding)/        # Splash / permissions flow
│       │   ├── (tabs)/              # Main tab navigator
│       │   │   ├── _layout.tsx      # Tab bar config
│       │   │   ├── index.tsx        # Home feed (canonical animation reference)
│       │   │   ├── history.tsx      # Dish log timeline
│       │   │   ├── scan.tsx         # Camera dish scanner
│       │   │   ├── profile.tsx      # User + gamification
│       │   │   └── restaurant/[id]  # Detail screen (inside tabs so bar stays)
│       │   └── achievement/[id]     # Badge unlock screen
│       ├── components/
│       │   ├── primitives/          # Text, Button, Card, Screen — no business logic
│       │   ├── restaurant/          # RestaurantCard, HiddenGemBadge, VibeTag
│       │   ├── gamification/        # Badge, StreakFlame
│       │   └── camera/              # HolographicBrackets, Vignette
│       ├── hooks/
│       │   └── useReduceMotion.ts   # Accessibility: disable animations when requested
│       ├── lib/
│       │   ├── api/                 # Service clients (import only from api/index.ts)
│       │   ├── gamification/        # Badge criteria (badges.ts — fill in BADGES array)
│       │   ├── mock/                # JSON fixture files for dev/demo
│       │   ├── ranking/             # hiddenGemScore.ts (fill in scoring formula)
│       │   └── store/               # Zustand stores (auth.ts)
│       └── theme/
│           └── tokens.ts            # Single source for colors, radii, fonts, shadows
│
├── packages/
│   └── contracts/                   # Shared TypeScript types (RestaurantSummary, etc.)
│
└── standards/                       # Project-wide conventions
    ├── animations.md                # Spring presets, collapse pattern, parallax
    ├── libraries.md                 # Dependency registry with versions + purpose
    ├── structure.md                 # This file
    └── tokens.md                    # Design token reference
```

## Rules

- Screens import from `@/lib/api` only — never reach directly into `lib/api/discovery.ts`
- All styles via `theme/tokens.ts` + `StyleSheet.create` — no hardcoded hex values
- Primitives (`components/primitives/`) have zero business logic and zero API calls
- New hooks go in `hooks/` — colocate with the screen only if truly one-off
