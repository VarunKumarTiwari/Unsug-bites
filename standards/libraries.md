# Libraries

Core dependencies for the Unsung Bites mobile app. Pinned to Expo SDK 51.

## Navigation & Shell

| Package | Version | Purpose |
|---|---|---|
| `expo-router` | ~3.5 | File-based routing (tabs, stacks, deep links) |
| `expo-splash-screen` | ~0.27 | Hold splash until fonts load |
| `expo-status-bar` | ~1.12 | iOS/Android status bar tint |
| `react-native-safe-area-context` | 4.10 | `useSafeAreaInsets` for notch/island |
| `react-native-screens` | 3.31 | Native screen containers (required by expo-router) |
| `react-native-gesture-handler` | ~2.16 | Required root wrap for all gestures |

## Animation

| Package | Version | Purpose |
|---|---|---|
| `react-native-reanimated` | ~3.10 | Primary animation engine — runs on UI thread |
| `moti` | ^0.29 | Declarative `from/animate` for simple loops and transitions |

**Rule:** use Reanimated (`withTiming`, `withSpring`, `withSequence`) for anything driven by scroll, gestures, or precise physics. Use Moti only for standalone enter/exit or loop animations (skeleton shimmer). Never mix both on the same element.

## Data Fetching & State

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | ^5.59 | Server state — queries, caching, refetch |
| `zustand` | ^4.5 | Client state — auth session, UI flags |

**Rule:** server data lives in React Query; UI-only state lives in Zustand or local `useState`.

## UI & Icons

| Package | Version | Purpose |
|---|---|---|
| `lucide-react-native` | ^0.456 | Icon set — all icons come from here |
| `expo-image` | ~1.13 | Performant image with blurhash + transition |
| `react-native-svg` | 15.2 | SVG rendering (used by lucide, StreakFlame) |
| `expo-haptics` | ~13.0 | Tactile feedback on button press |

## Fonts

| Package | Version | Purpose |
|---|---|---|
| `@expo-google-fonts/fraunces` | ^0.2 | Serif display + headings |
| `@expo-google-fonts/inter` | ^0.2 | Body copy, labels |

## Camera (pending integration)

| Package | Version | Purpose |
|---|---|---|
| `expo-camera` | ~15.0 | Dish scanning — wired into scan.tsx when real capture is ready |

## Styling

No CSS framework. All styles come from `theme/tokens.ts` via `StyleSheet.create`. See `standards/tokens.md`.

## Removed

- `nativewind` / `tailwindcss` — zero `className` usage; StyleSheet + tokens is the one system
- `@expo/vector-icons` — replaced by lucide-react-native
- `@shopify/react-native-skia` — reinstall when Skia effects (confetti, vignette) are implemented
- `expo-blur` — reinstall when frosted glass overlays are needed
- `expo-linking`, `expo-constants` — reinstall when deep links / build config are needed
