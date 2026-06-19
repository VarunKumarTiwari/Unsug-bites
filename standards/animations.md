# Animation Standards

Reference: `apps/mobile/app/(tabs)/index.tsx` is the canonical example.
All motion values come from `@unsung/ui` — never inline `{ damping, stiffness, mass }` or raw `duration` numbers.

## Library split

- **Reanimated** — scroll-driven, gesture-driven, precise physics, multi-step sequences
- **Moti** — standalone enter/exit, declarative loops (skeleton, color transitions)
- Never mix both on the same element

## Motion tokens

```ts
import { spring, duration, easing } from '@unsung/ui';

spring.gentle  // sheets, modals, screen entries        — { damping: 22, stiffness: 200, mass: 1 }
spring.snappy  // toggles, pills, list-item returns     — { damping: 18, stiffness: 260, mass: 0.7 }
spring.bouncy  // press-release on chips and cards      — { damping: 9,  stiffness: 260, mass: 0.55 }

duration.micro    // 80   — press compression
duration.fast     // 150  — quick fades, color shifts, dismissals
duration.base     // 300  — entry fades, slide-ins
duration.slow     // 400  — hero / section staggered entries
duration.ambient  // 650  — shimmer loops, ambient parallax

easing.out  // entries, fades-in, settles
easing.in   // exits, compress, dismiss
```

## Press patterns

```tsx
// Tap-down then settle:
onPressIn:  scale.value = withTiming(0.91, { duration: duration.micro })
onPressOut: scale.value = withSpring(1, spring.bouncy)
```

## Multi-step sequence (content slide on tab switch)

```ts
contentTranslateX.value = withSequence(
  withTiming(dir * -24, { duration: 100, easing: easing.in }),
  withTiming(dir * 32,  { duration: 0 }),
  withSpring(0, spring.snappy),
);
contentOpacity.value = withSequence(
  withTiming(0, { duration: 100, easing: easing.in }),
  withDelay(10, withTiming(1, { duration: 180, easing: easing.out })),
);
```

## Enter animations (FadeInDown)

List items entering the feed:
```ts
entering={FadeInDown.delay(Math.min(50 * index, 200)).duration(360).springify().damping(20)}
```

Hero / header stagger:
```ts
// Row 0: FadeInDown.duration(300)
// Row 1: FadeInDown.delay(60).duration(350)
// Row 2: FadeInDown.delay(120).duration(350)
// ...increment delay by 60ms per row
```

## Scroll-driven collapse (collapsing header pattern)

```ts
const COLLAPSED_HEADER_H = 52;
const HERO_COLLAPSE_START = 80;
const HERO_COLLAPSE_END   = 145;
const CHIPS_STICKY_START  = 185;
const CHIPS_STICKY_END    = 210;
```

## Parallax (featured card image)

```ts
const PARALLAX_RANGE = 20;
parallaxOffset = interpolate(
  scrollY,
  [FEATURED_CARD_OFFSET - 100, FEATURED_CARD_OFFSET + 100],
  [PARALLAX_RANGE, -PARALLAX_RANGE],
  CLAMP,
)
```

## Accessibility

Read `useReduceMotion` from `@/hooks/useReduceMotion`. When true:
- Skip spring/sequence animations on press; set values directly
- Timing-only (opacity) for enter animations is acceptable

## Skeleton loading

Use Moti for shimmer. Stagger each card by 120–150ms; loop duration = `duration.ambient`:
```tsx
<MotiView
  from={{ opacity: 0.35 }}
  animate={{ opacity: 0.7 }}
  transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 150 + i * 120 }}
/>
```
