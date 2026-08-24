# Floating Bottom Nav (Instagram-style shrink)

## Objective
Replace the app's edge-attached bottom tab bar with a floating rounded "pill" nav
that visually matches the landing page nav (img_2/img_4): a cream rounded pill where
the active tab is a filled red chip with icon + label, and inactive tabs are muted.
The pill reacts to scroll — full size at the top of a screen, shrinking to a compact
icons-only bar (active tab keeps its labeled red chip) as the user reads down content,
then growing back when they scroll up or return to the top. Applies to all platforms
(native iOS/Android + web), adapting width to the viewport (near-full-width on phones,
centered fixed-width on desktop).

## Requirements
R1. The bottom navigation renders as a floating pill: detached from the screen edge
    with horizontal margins and a bottom gap (above the safe-area inset), rounded
    corners, cream/surface background, and an elevation/shadow so it floats over content.
R2. Tab set and destinations are unchanged: Home, History, Scan, Profile (same routes,
    icons Home/Clock/Camera/User, same active route highlighting). The `restaurant/[id]`
    detail screen stays inside the navigator with the pill visible.
R3. Active tab is a filled red (`color.primary.base`) rounded chip containing the icon +
    label in on-primary text. Inactive tabs show a muted icon + label
    (`color.text.subtle`), no chip — matching landing nav img_4.
R4. Expanded state (default, at top of screen / scrolling up): pill is full height with
    every tab showing icon + label.
R5. Shrunk state (while scrolling down through content): pill reduces height and inactive
    tabs collapse to icon-only (labels hidden). The active tab STILL shows its icon +
    label inside the red chip in the shrunk state.
R6. Scroll direction drives the transition: scrolling down (reading content) shrinks the
    pill; scrolling up, or being at/near the top (offset ≈ 0), expands it. Transition is
    animated (smooth width/height/opacity), not an instant snap.
R7. All four tab screens (Home, History, Scan, Profile) report their scroll to the nav so
    the shrink behavior works on every screen that has scrollable content. Screens must
    reuse their existing reanimated `onScroll` handlers/`scrollY` — do not add a second
    scroll listener.
R8. Width is responsive: on narrow (phone) viewports the pill spans most of the width with
    small side margins; on wide (desktop/web) viewports the pill is a centered element with
    a capped max-width so it doesn't stretch across the whole screen.
R9. Nav is a shared component driven by a shared scroll state (the pill lives in the tab
    layout, screens live elsewhere), so a single shrink/expand state is coordinated across
    tab switches.
R10. Delivered on a NEW branch created from `main`.

## Constraints
- Stack: Expo Router + React Native (`apps/mobile`), reanimated for scroll animation,
  `@unsung/ui` design tokens (`color`, `text`). Web target is Expo web.
- Reuse existing per-screen `useAnimatedScrollHandler`/`scrollY` values already present in
  index/history/scan/profile — feed a shared scroll-direction state, don't duplicate.
- Replace the default `Tabs` `tabBarStyle` approach with a custom `tabBar` component (or
  equivalent) so the pill can float and animate. Keep expo-router `<Tabs>` routing intact.
- Respect `useSafeAreaInsets()` bottom inset so the floating pill sits above the home
  indicator / gesture bar.
- Scope: bottom nav only. No route changes, no screen-content redesign, no landing-page
  changes. Icons/labels/colors come from existing tokens — no new dependencies.
- The shrink is size + label visibility only (per user: "just the size is fine"): no
  slide-off-screen / full hide, no partial peek.

## Edge Cases
- Screen content shorter than viewport (nothing to scroll): pill stays expanded; no jitter.
- Rapid up/down scroll flicks: debounce/threshold so the pill doesn't flap between states
  every frame (use a direction threshold, not raw per-frame delta).
- At exact top (offset 0) after scrolling down: pill must return to expanded.
- Switching tabs while shrunk: new screen starts in a sensible state (expanded at top, or
  reflects the shared state) without a flash of wrong size.
- Very narrow viewport where 4 labeled tabs won't fit expanded: labels shrink/ellipsize or
  the layout degrades gracefully (icons remain tappable); active chip label stays readable.
- Desktop with no touch scroll momentum: wheel scroll still triggers shrink/expand.
- Safe-area = 0 devices (older Android / web): pill still has a visible bottom gap.
- Active tab's label must remain visible in shrunk state even for the longest label.

## Definition of Done
- [ ] New branch created from `main` for this work (R10).
- [ ] Bottom nav is a floating, shadowed, rounded pill above the safe-area inset (R1).
- [ ] Home/History/Scan/Profile tabs + routes + `restaurant/[id]` behavior unchanged (R2).
- [ ] Active tab = filled red chip with icon+label; inactive = muted icon+label (R3).
- [ ] Expanded state shows icon+label on all tabs (R4).
- [ ] Scrolling down shrinks the pill; inactive tabs go icon-only, active keeps its
      labeled red chip (R5).
- [ ] Scroll-down shrinks / scroll-up + top expands, animated smoothly (R6).
- [ ] All four tab screens drive the shrink via their existing scroll handlers (R7).
- [ ] Pill is near-full-width on phone, centered + max-width on desktop/web (R8).
- [ ] A single shared scroll state coordinates the pill across screens/tab switches (R9).
- [ ] Short-content, rapid-flick, top-return, tab-switch, and narrow-viewport edge cases
      behave without jitter or clipped active label.
