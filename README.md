# Unsung Bites — Monorepo

Cross-platform (iOS + Android + Web) restaurant discovery app with in-venue AI dish scanning.

## Layout

```
apps/
└── mobile/              # Expo (React Native + Web) — the only frontend (SPA)

services/                # Each folder = one microservice. Independently deployable later.
├── discovery/           # Nearby restaurants, search, hidden-gem ranking
├── scan/                # Photo upload + AI dish detection
├── nutrition/           # Ingredient + macro lookup
├── reviews/             # User dish reviews + ratings
├── gamification/        # Badges, streaks, achievements
├── users/               # Profile, auth, preferences
└── recommendations/     # Personalized feed (data flywheel target)

packages/
└── contracts/           # Shared TypeScript types — the ONLY thing services + app share
```

## Loose Coupling Rules

1. **Services know nothing about each other.** They share zero code. They share only types in `packages/contracts/`.
2. **The mobile app talks to services through a thin client adapter** (`apps/mobile/lib/api/`). Today every adapter reads from local mock JSON. To go live, swap the adapter body — no screens change.
3. **Each service has its own `mock/` folder.** This is the contract example: real responses must match the mocks' shapes.
4. **Each service has a `README.md` and `openapi.yaml`** describing its endpoints. No code yet — the contract IS the deliverable for now.

## Current Phase

**Frontend SPA only**, fully driven by mock JSON. No real backend, no real maps integration, no real AI.
```

# Unsug-bites
