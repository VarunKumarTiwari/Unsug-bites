# Unsung Bites — Monorepo

Cross-platform restaurant discovery app with in-venue AI dish scanning. **One Expo codebase ships to iOS, Android, and Web.**

## Layout

```
apps/
└── mobile/                  # Expo (React Native + Web) — the only frontend

packages/
├── ui/                      # Design system: tokens + primitives. Imported as @unsung/ui.
└── contracts/               # Shared TypeScript types between app + services

services/                    # Each folder = one microservice (mock JSON today, real later)
├── discovery/               # Nearby restaurants, search, hidden-gem ranking
├── scan/                    # Photo upload + AI dish detection
├── nutrition/               # Ingredient + macro lookup
├── reviews/                 # User dish reviews + ratings
├── gamification/            # Badges, streaks, achievements
├── users/                   # Profile, auth, preferences
└── recommendations/         # Personalized feed

standards/                   # Project-wide conventions
docs/
└── showcase.html            # Open in a browser — visual reference for every component
```

## Setup (once)

Requires Node 18+, npm, and (for native) Xcode + Android Studio.

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed because of a peer-dep conflict in `react-native-worklets` — leaving it off will fail with ERESOLVE.

## Running the app

All commands run from the **repo root**.

### iOS

```bash
npm run mobile:ios
```

Builds the native iOS app, launches the iOS Simulator, and starts the Metro bundler. First build takes ~3-5 minutes (native compilation); subsequent runs are fast. Requires Xcode installed and at least one iOS Simulator configured.

To run on a physical device: open `apps/mobile/ios/UnsungBites.xcworkspace` in Xcode, select your device, and hit Run.

### Android

```bash
npm run mobile:android
```

Builds the native Android app, launches an emulator (or attached device), and starts Metro. Requires Android Studio with at least one AVD set up, or a physical device with USB debugging enabled.

If the emulator doesn't auto-launch, start one from Android Studio's Device Manager first, then re-run the command.

### Web

```bash
npm run mobile:web
```

Starts Metro in web mode and opens `http://localhost:8081` in your default browser. No native toolchain required — this is the fastest way to iterate on UI changes.

Same React Native code, rendered through `react-native-web`. Most components work identically; native-only APIs (haptics, camera) become no-ops on web.

### Dev menu (Metro)

If you prefer to start the bundler first and pick a target from the menu:

```bash
npm run mobile           # equivalent to: expo start
```

Then press `i` for iOS, `a` for Android, or `w` for Web in the terminal.

## Development reference

**While building UI**, keep `docs/showcase.html` open in a browser tab — it shows every token, primitive, and domain component with rendered previews and copyable code snippets.

```bash
open docs/showcase.html
```

## Standards

| File | What's in it |
|---|---|
| `standards/structure.md` | Where files go, what `@unsung/ui` exports, import rules |
| `standards/tokens.md` | Every color, spacing, radius, typography variant — names + values |
| `standards/animations.md` | Spring presets, motion tokens, scroll-driven patterns |
| `standards/libraries.md` | Pinned dependencies + what each is for |

## Architecture rules

1. **Tokens & primitives live in `packages/ui`.** Add once → all targets get it. Always import via `@unsung/ui`, never deep paths.
2. **No hardcoded design values in app code.** Colors, spacing, radii, fonts, springs — all come from `@unsung/ui`.
3. **Services know nothing about each other.** They share zero code. They share only types in `packages/contracts/`.
4. **Screens talk to services via `apps/mobile/lib/api/`.** Today every adapter reads mock JSON. To go live, swap the adapter body — no screens change.
5. **Each service has its own `mock/` folder + `README.md` + `openapi.yaml`.** The contract is the deliverable for now; code comes later.

## Running backend services (Docker)

All 7 backend services can be started with a single command. Each runs as an independent container serving mock API responses from its OpenAPI spec.

**Requires:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
docker compose up
```

This starts all services on separate ports:

| Service         | URL                        |
|-----------------|----------------------------|
| Discovery       | http://localhost:4010      |
| Gamification    | http://localhost:4011      |
| Nutrition       | http://localhost:4012      |
| Recommendations | http://localhost:4013      |
| Reviews         | http://localhost:4014      |
| Scan            | http://localhost:4015      |
| Users           | http://localhost:4016      |

To run a single service: `docker compose up discovery`

To stop: `docker compose down`

## Current phase

Frontend SPA only, fully driven by mock JSON. No real backend, no real maps, no real AI.
