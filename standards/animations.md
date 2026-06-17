# Animation Standards

Reference: `apps/mobile/app/(tabs)/index.tsx` is the canonical example.

## Library split

- **Reanimated** — scroll-driven, gesture-driven, precise physics, multi-step sequences
- **Moti** — standalone enter/exit, declarative loops (skeleton, color transitions)
- Never mix both on the same element

## Spring presets

Use these values everywhere. Don't invent per-component values.

```ts
// Default button / chip press
{ damping: 8, stiffness: 220, mass: 0.6 }

// Toggle pill slide
{ damping: 16, stiffness: 280, mass: 0.6 }

// Icon pop-on-activate
withSequence(
  withTiming(0.6, { duration: 80, easing: Easing.in(Easing.cubic) }),
  withSpring(1, { damping: 7, stiffness: 300, mass: 0.5 }),
)

// Content slide on tab switch (index.tsx feedView toggle)
contentTranslateX: withSequence(
  withTiming(dir * -24, { duration: 100, easing: Easing.in(Easing.cubic) }),
  withTiming(dir * 32,  { duration: 0 }),
  withSpring(0, { damping: 18, stiffness: 220, mass: 0.7 }),
)
contentOpacity: withSequence(
  withTiming(0, { duration: 100, easing: Easing.in(Easing.cubic) }),
  withDelay(10, withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) })),
)
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
const HERO_COLLAPSE_START = 80;   // scroll offset where hero starts compressing
const HERO_COLLAPSE_END   = 145;  // offset where it's fully collapsed
const CHIPS_STICKY_START  = 185;
const CHIPS_STICKY_END    = 210;
```

Hero compress:
```ts
opacity:   interpolate(scrollY, [0, HERO_COLLAPSE_START], [1, 0.5], CLAMP)
scale:     interpolate(scrollY, [0, HERO_COLLAPSE_END],   [1, 0.92], CLAMP)
translateY: interpolate(scrollY, [0, HERO_COLLAPSE_END],  [0, -10], CLAMP)
```

Collapsed header slide-in:
```ts
const p = interpolate(scrollY, [HERO_COLLAPSE_START, HERO_COLLAPSE_END], [0, 1], CLAMP);
opacity:    p
translateY: interpolate(p, [0, 1], [-COLLAPSED_HEADER_H, 0])
```

## Parallax (featured card image)

```ts
const PARALLAX_RANGE = 20; // px of total travel

parallaxOffset = interpolate(
  scrollY,
  [FEATURED_CARD_OFFSET - 100, FEATURED_CARD_OFFSET + 100],
  [PARALLAX_RANGE, -PARALLAX_RANGE],
  CLAMP,
)
// Image is oversized by PARALLAX_EXTRA=40px and centered at rest via marginTop: -(PARALLAX_EXTRA/2)
```

## Accessibility

All components must read `useReduceMotion` from `@/hooks/useReduceMotion`. When true:
- Skip spring/sequence animations on press; set values directly
- Timing-only (opacity) for enter animations is acceptable

## Press feedback

All tappable elements use `Pressable` with inline scale/opacity on the style callback:
```tsx
style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
```

For components that need animated press (scale spring), use a `useSharedValue(1)` + `onPressIn/Out` pattern (see `VibeChip`, `ToggleButton` in index.tsx).

## Skeleton loading

Use Moti for shimmer. Stagger each card by 120–150ms:
```tsx
<MotiView
  from={{ opacity: 0.35 }}
  animate={{ opacity: 0.7 }}
  transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 150 + i * 120 }}
/>
```
