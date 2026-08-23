# Scan & Review Redesign

## Objective
The current Scan result experience renders as an absolutely-positioned bottom sheet whose snap points are computed from `SCREEN_HEIGHT` percentages (`SNAP_HALF`/`SNAP_FULL` in `apps/mobile/app/(tabs)/scan.tsx`). This breaks across viewports: on a narrow-tall device (Galaxy Z Fold) the primary "Log & Submit Review" button is clipped behind the tab bar; on a tablet (iPad Air) a large empty gap appears below the content. Replace the gesture sheet with a real, normally-scrolling full-screen route that behaves consistently on every device. Flow: capture → compact result card in the camera view → tap to open a dedicated detail page (photo + nutrition first, review form gated behind an intent tap) → sticky primary button that is never clipped and never floats with a dead gap.

## Requirements
R1. After a successful capture on the Scan tab, the camera view shows a **compact result card** (not the full gesture sheet): the dish photo (modest size), detected dish name, and confidence. No nutrition and no review form are shown at this stage. The card exposes exactly one primary action to continue (tapping the card and/or an explicit button both open the detail page).
R2. Continuing from the result card **navigates to a dedicated full-screen route** (outside `(tabs)`, mirroring the `achievement/[id].tsx` pattern) so the bottom tab bar is not visible on the detail page.
R3. The detail page is a **single normally-scrolling page** (a standard `ScrollView`/`FlatList`, no `SCREEN_HEIGHT`-percentage snap points, no pan-gesture sheet). Layout must be driven by content + flex + safe-area insets, not hard-coded screen fractions.
R4. The detail page shows, in order: a **header photo band** at the top (a normal in-flow image, modest height — not a full-bleed background, not a tiny thumbnail; the dish is clearly visible but nutrition/review are the focus), the dish name + confidence, key ingredients, and the **nutrition** section.
R5. The **review form is gated** ("progressive reveal", option b1): it is not shown on initial page load. An explicit CTA ("Add your review" or equivalent) reveals the form inline within the same page. Before reveal the user sees food info only; after reveal the review fields (restaurant, location, cuisine, ratings, portion, order-again, occasion, notes) appear.
R6. The primary button lives in a **sticky footer** pinned above the bottom of the screen. It is always visible regardless of scroll position, content scrolls behind/under it, and its bottom padding respects `useSafeAreaInsets().bottom` so it is never clipped on devices with a tab bar/home indicator and never floats with a dead gap on tall/tablet screens.
R7. The sticky button's label/behavior reflects the gate state: before the form is revealed it triggers the reveal (e.g. "Add your review"); after reveal it submits/saves the review (e.g. "Save Review"). A single sticky footer button, not two competing buttons.
R8. The detail page has a top bar with a back/close control that returns to the Scan tab (camera view), and dismisses cleanly without leaving the sheet half-open.
R9. The redesign **verifiably works on both extreme viewports** — Galaxy Z Fold (~344×882, narrow-tall) and iPad Air (~820×1180, wide): the primary button is fully visible and tappable on both, with no clipping and no large dead gap below content.
R10. All existing scan functionality is preserved: capture flow (preview → scanning → result), mock scan + nutrition data (`scan.submitScan`, `nutrition.getNutrition`), reduce-motion handling, and the review form fields/inputs (`StarRating`, `VibeChip`, cuisine/portion/occasion/order-again/notes).

## Constraints
- Stack: React Native + Expo Router + Reanimated + `@unsung/ui` design tokens (`color`, `radius`, `space`, `spring`, `Text`, `Button`). Match existing conventions in `apps/mobile`.
- New route lives under `apps/mobile/app/` outside the `(tabs)` group (e.g. `scan-result.tsx` or `scan-result/[id].tsx`), following the existing `achievement/[id].tsx` full-screen pattern; `_layout.tsx` already renders a headerless `Stack` with `animation: 'none'`.
- Scan result + nutrition data must reach the detail route. Prefer passing an id/key via route params and re-fetching from the mock APIs, or a lightweight shared reference — do not duplicate the mock data.
- No new dependencies. Reuse `StarRating`, `VibeChip`, `Button`, and existing form state/fields.
- Remove the obsolete `SNAP_HALF`/`SNAP_FULL`/`SNAP_DISMISSED` snap logic and the pan-gesture `ResultSheet` from the result experience. The camera preview/scanning phases and `HolographicBrackets`/`Vignette`/shutter stay.
- In scope: Scan result card + new detail route + sticky footer + gated form. Out of scope: the camera capture visuals themselves (shutter, brackets, shimmer), Home/History/Profile tabs, backend/API changes.

## Edge Cases
- Very narrow + tall (Galaxy Z Fold, 344 wide): header photo, nutrition chips (3 across), and chip rows must wrap/scale without overflow; sticky button not clipped.
- Wide/tablet (iPad Air, 820 wide): no oversized dead gap below content; button sits at the true bottom (respecting inset), content is not stretched awkwardly.
- Devices with a home indicator / large safe-area bottom inset vs. none: sticky footer padding adapts via `insets.bottom`.
- Keyboard open while editing text fields (restaurant/location/notes): sticky button and focused input stay visible (KeyboardAvoidingView / keyboard-aware scroll), form remains scrollable.
- Reduce-motion enabled: reveal of the form and any transitions degrade to instant / no animation.
- Back/close pressed after revealing the form: returns to camera cleanly, no orphaned state; re-scanning starts fresh (`preview` phase, cleared result).
- Tapping the primary button before the form is revealed reveals it (does not submit an empty review).

## Definition of Done
- [ ] R1 — capture shows a compact result card (photo + name + confidence only), no nutrition/form, one clear continue action.
- [ ] R2 — continuing opens a full-screen route outside `(tabs)`; tab bar not visible on detail page.
- [ ] R3 — detail page is a normal scroll view; no `SCREEN_HEIGHT`-percentage snap points or pan-gesture sheet remain.
- [ ] R4 — detail page order: header photo band (modest, in-flow) → name + confidence → ingredients → nutrition.
- [ ] R5 — review form is gated; hidden on load, revealed by an explicit CTA within the page.
- [ ] R6 — primary button is a sticky footer, always visible, bottom padding respects `insets.bottom`; no clipping, no dead gap.
- [ ] R7 — sticky button label/behavior switches between "reveal form" and "save review"; single button.
- [ ] R8 — top bar back/close returns to camera and dismisses cleanly.
- [ ] R9 — verified on Galaxy Z Fold (344×882) and iPad Air (820×1180): button fully visible/tappable, no clip, no dead gap.
- [ ] R10 — capture flow, mock scan/nutrition, reduce-motion, and all review fields preserved and working.
