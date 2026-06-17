---
name: Unsung Bites
description: A restaurant discovery app for hidden-gem locals spots — intimate, honest, understated.
colors:
  candlelit:       "#A92D1B"
  candlelit-soft:  "#F5EAE8"
  alabaster:       "#FDFCF7"
  surface:         "#FFFFFF"
  ink:             "#1C1C1E"
  ink-muted:       "#1C1C1E99"
  ink-subtle:      "#1C1C1E66"
  warm-olive:      "#5A684D"
  olive-soft:      "#5A684D1A"
  stone:           "#EFECE6"
typography:
  display:
    fontFamily: "Fraunces_600SemiBold, Georgia, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "Fraunces_500Medium, Georgia, serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "Fraunces_500Medium, Georgia, serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Inter_400Regular, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter_500Medium, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.6px"
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "28px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "40px"
  8: "48px"
components:
  button-primary:
    backgroundColor: "{colors.candlelit}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  card-lifted:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-flat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  vibe-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  hidden-gem-badge:
    backgroundColor: "{colors.candlelit-soft}"
    textColor: "{colors.candlelit}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Unsung Bites

## 1. Overview

**Creative North Star: "The Dog-Eared Guidebook"**

Unsung Bites is worn, loved, and passed between friends. Every screen is a recommendation from someone who actually eats there — not a platform, not an algorithm, a person with taste and a reason to tell you about it. Fraunces earns its editorial weight: it carries warmth and authority without decoration. Inter handles the functional layer with quiet competence. Images carry atmosphere; UI steps back.

Design is honest over refined. No polish for polish's sake. The restraint is the point — in a category drowning in banners, badges, and urgency, doing less precisely is the brand move. Warmth comes from typography and voice, not from background tint. The Alabaster field is nearly white; the Candlelit accent supplies all the heat the system needs.

Surfaces are largely flat; the modest card shadow distinguishes lifted content from the background without theatrics. Motion is intentional and unhurried — like the app itself, nothing rushes you.

**Key Characteristics:**
- Fraunces for every editorial surface; Inter for everything functional
- Candlelit accent (#A92D1B) on ≤10% of any given screen — rarity is the brand
- Flat-by-default surfaces with one ambient card shadow and one accent pin glow
- Pill-shaped interactive controls; content containers use a generous but not-excessive radius
- Warm-olive (#5A684D) for earned, positive states (verified, local, nutritional)
- Space is a design element — generous padding, varied rhythm, nothing crowded

## 2. Colors: The Candlelit Palette

A near-white field, one honest red, one verdant local green. Three roles, no surplus.

### Primary
- **Candlelit** (#A92D1B): The accent and the brand anchor. CTAs, active tab indicators, hidden gem badge text, streak markers, price highlights. Used sparingly — its presence signals significance. If it appears on more than ~10% of a screen, pull back.

### Secondary
- **Warm Olive** (#5A684D): Verified states, nutritional green, "local favorite" cues. The counterpart to Candlelit: where Candlelit is discovery and heat, Olive is trust and rootedness. Never use them side-by-side on the same element.

### Neutral
- **Alabaster** (#FDFCF7): Page background. Near-white with the faintest warmth toward the brand hue — not a cream, not a bone, not a sand. The warm-neutral band is the AI default of 2026 and strictly prohibited on new surfaces. This value was chosen before that doctrine and is preserved for identity continuity.
- **Surface** (#FFFFFF): Cards, sheets, modals. Pure white — sits cleanly above Alabaster without a border.
- **Ink** (#1C1C1E): Primary text, icons. System charcoal, not pure black.
- **Ink Muted** (#1C1C1E at 60% opacity): Secondary text, metadata lines, cuisine/neighborhood labels.
- **Ink Subtle** (#1C1C1E at 40% opacity): Tertiary text, placeholders, inactive tab icons.
- **Stone** (#EFECE6): Borders, dividers, unselected toggle backgrounds, card borders in flat variant. The lightest surface-adjacent neutral.
- **Candlelit Soft** (#A92D1B at 8% opacity): Badge backgrounds, tonal fills behind the accent. Warm but not loud.
- **Olive Soft** (#5A684D at 10% opacity): Tonal fills behind olive elements.

### Named Rules
**The One Candle Rule.** Candlelit appears on ≤10% of any screen's surface area. Its rarity is what makes it feel like a recommendation, not a notification.

**The Two-Accent Separation Rule.** Candlelit and Warm Olive are never co-located on the same element or adjacent elements in the same visual cluster. They are distinct signals; mixing them reads as noise.

## 3. Typography: Fraunces + Inter

**Display Font:** Fraunces (SemiBold 600 / Medium 500) — variable-axis optical serif with genuine character
**Body Font:** Inter (Regular 400 / Medium 500 / SemiBold 600) — humanist sans-serif, the functional layer
**Label/Mono Font:** Inter Medium — same family, heavier weight, uppercase with tracking for metadata

**Character:** Fraunces brings editorial warmth and historical depth; Inter provides spatial clarity and legibility. The pairing works because they contrast on every axis that matters — structure (serif vs. humanist), energy (expressive vs. neutral), role (hero vs. workhorse). Neither tries to be the other.

### Hierarchy
- **Display** (Fraunces SemiBold 600, 34px, leading 1.05, tracking -0.3px): App wordmark, hero screen headings, editorial section titles. One per screen maximum.
- **Headline** (Fraunces Medium 500, 28px, leading 1.15): Screen-level headings on brand surfaces (splash tagline). Not used in product tabs.
- **Title** (Fraunces Medium 500, 18px, leading 1.3): Restaurant names in detail view, section names, tab menu items with editorial intent.
- **Body** (Inter Regular 400, 15px, leading 1.5): All body copy, descriptions, review text. This is the workhorse; most screen text is this.
- **Body Medium** (Inter Medium 500, 15px): Secondary headings within content blocks, ingredient names, emphasized metadata.
- **Body Semibold** (Inter SemiBold 600, 15px): Button labels, rating figures, price values, anything that needs functional emphasis without size increase.
- **Label** (Inter Medium 500, 11px, tracking 0.6px, uppercase): Tab bar labels, badge text, filter chips, cuisine category tags.

### Named Rules
**The Serif Threshold Rule.** Fraunces appears only on editorial surfaces (brand register: splash, home hero, restaurant names, section titles with editorial intent) and never on purely functional elements (input labels, error messages, loading indicators, settings rows). Crossing this line makes the app feel inconsistent, not warm.

**The Small-Text Floor Rule.** No body text below 13px. No label text below 11px. Ink Muted is the minimum tone for readable secondary text against Alabaster — Ink Subtle is only for tertiary metadata and placeholder text.

## 4. Elevation

The system is flat by default. Surfaces are distinguished from each other by color (Alabaster vs. Surface white) and by position, not by depth. Shadows appear for two specific structural reasons only.

### Shadow Vocabulary
- **Card Ambient** (`shadowColor: #1C1C1E, shadowOpacity: 0.06, shadowRadius: 24, offset: 0 8`): Applied to RestaurantCard and the lifted Card variant. A diffuse, large-radius ambient lift — barely perceptible, just enough to separate the card from the page without theatrics. The low opacity (0.06) and large radius (24) are intentional: avoid darkening the shadow or reducing the radius, both produce a "2014 app" reading.
- **Accent Pin Glow** (`shadowColor: #A92D1B, shadowOpacity: 0.25, shadowRadius: 12, offset: 0 0`): Used exclusively for map pin elements and any element that needs to feel "found" or surfaced. A colored glow, not a drop shadow — its purpose is attention, not depth.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow is a structural signal, not decoration. If an element receives a shadow because "it looks nice", remove it.

**The Two-Shadow Rule.** The system has exactly two shadow roles. No intermediate shadows, no per-component custom box-shadows, no shadow on text.

## 5. Components

### Buttons
Warm and approachable — generous padding, fully pill-shaped, soft press feedback. Nothing snappy; the interaction should feel like picking something up, not clicking.

- **Shape:** Full pill (radius 999px). All button variants share the same geometry.
- **Primary:** Candlelit background (#A92D1B), Surface text (#FFFFFF). Padding 14px vertical / 24px horizontal. Full-width by default on brand surfaces; self-sizing in product contexts.
- **Press state:** opacity 0.85 + scale 0.98. No color shift on press — the scale is enough.
- **Disabled:** opacity 0.5, non-interactive.
- **Secondary:** Surface background, Ink text, 1px Stone border. Same padding and radius as primary.
- **Ghost:** Transparent background, Ink text. For low-emphasis actions in content-dense contexts.
- **Loading:** ActivityIndicator replaces label; color inherits from variant (Surface on primary, Ink on others).
- **Leading icon:** 8px gap between icon and label. Icon color matches text tone.

### Cards / Containers
- **Lifted:** Surface white background, radius.lg (22px), ambient card shadow, 16px internal padding. The default for restaurant cards and surfaced content.
- **Flat:** Surface white background, radius.lg (22px), 1px Stone border, no shadow, 16px padding. For inline containers within a larger card — prevents shadow nesting.
- **Internal padding:** 16px standard. 12px on restaurant cards (tighter image-to-text feel). Never 8px or less in a card context.
- **Corner style:** 22px (lg) for content cards; 28px (xl) for the bottom-sheet editorial panel on restaurant detail.

### Restaurant Card
The signature component. Image-led, text minimal.
- Image fills the full card width at 4:3 (grid) or 16:9 (row layout).
- HiddenGemBadge overlays top-left at 10px inset.
- Restaurant name in Title (Fraunces 500, 18px). Cuisine · Neighborhood in small muted body. Rating inline with review count.
- Press: opacity 0.92 + scale 0.985.
- Shadow: Card Ambient only. Never the accent pin glow on a card.

### VibeTag / Chips
Pill-shaped, surface background, Stone border, icon + label. Two sizes: md (14px icon, 8/14px padding) and sm (12px icon, 6/10px padding). The icon and label are always the same Ink tone — no colored chips except HiddenGemBadge.

### HiddenGemBadge
Appears only when hiddenGemScore ≥ 0.7. Candlelit Soft background (#A92D1B at 8%), Candlelit text, Sparkles icon. Pill radius. This is the one component where the accent appears in a background role — kept to a light tint to obey the One Candle Rule.

### Tab Bar (Bottom Nav)
Surface background, Stone top border, 64px height. Candlelit active tint, Ink Subtle inactive. Label in Inter Medium 11px, tracking 0.4. Icons at size-2 relative to system default.

### Tab Selector (Inline)
Used on Restaurant Detail for "The Legends" / "The Unsung Bites" toggle. Bottom-border treatment: 2px Candlelit on active, transparent on inactive. Fraunces Medium, small, serif. Serif here is intentional — the tab names are editorial headings, not UI labels.

### Bottom-Sheet Panel (Restaurant Detail)
White surface, radius.xl (28px) top corners, overlaps image by -32px via negative margin. Hosts all editorial content below the hero image. The `...shadow.card` spread creates the ambient lift that separates it from the hero.

### Badge (Gamification)
78×78px container, radius.lg. Unlocked: Surface background, accentSoft border, full icon at 36px in Candlelit. Locked: Stone background, Stone border, Ink Subtle icon at 40% opacity. Label in Label style (11px uppercase, tracking 0.6) below, centered.

## 6. Do's and Don'ts

### Do:
- **Do** use Fraunces for every editorial heading and restaurant name. The serif is the editorial voice; don't swap it for Inter in those contexts for "consistency".
- **Do** let images carry atmosphere. In brand-register screens (splash, home hero, restaurant detail), the image IS the design. UI should support it, not compete.
- **Do** keep Candlelit rare. One CTA per screen is ideal. The moment it appears on more than ~10% of a surface, it stops signaling significance.
- **Do** use Warm Olive for positive, earned states — verified, nutritional, local endorsement. It reads as "trustworthy" precisely because it's not the same red as the CTAs.
- **Do** keep cards flat when they're already inside a lifted container. Nested shadows (lifted card inside a bottom sheet with its own shadow) always look wrong.
- **Do** write generous tap targets — minimum 44×44pt for all interactive elements. This app is used outdoors, in bright light, often while walking.
- **Do** include `prefers-reduced-motion` fallbacks for all animations. Crossfade or instant state change is the reduced-motion default; never remove motion entirely on the non-reduced path.
- **Do** use Stone (#EFECE6) for borders and dividers. Never a custom rgba border that approximates it — token consistency is what keeps the system coherent across screens.

### Don't:
- **Don't** use DoorDash / Uber Eats energy: promotional banners, discount badges, urgency language ("Order now!", "Limited time!"), transactional CTAs. Unsung Bites does not convert; it recommends.
- **Don't** use star ratings as the dominant visual element on any surface. This is Yelp territory. Ratings exist as metadata, not as the thing being sold.
- **Don't** over-style food photography with filters, borders, or rounded corners baked into the image. Expo Image handles display treatment; never modify source images.
- **Don't** use gradient text (background-clip: text with any gradient). Never used, never appropriate in this system.
- **Don't** use side-stripe borders (border-left > 1px as a colored accent). Not in this system.
- **Don't** add glassmorphism decoratively. The system is opaque and flat; blur effects are not part of the vocabulary.
- **Don't** use a tinted background (cream, sand, parchment, linen) on any new surface. Warmth is delivered through Candlelit, Fraunces, and imagery — not background tint.
- **Don't** put Fraunces on functional UI elements: error messages, input labels, loading text, settings rows, empty states (unless the empty state has an explicit editorial heading).
- **Don't** place Candlelit and Warm Olive on adjacent or co-located elements. They are separate signals and must remain distinct.
- **Don't** add a third shadow role. The system has Card Ambient and Accent Pin Glow. Custom shadows on any other element break the elevation vocabulary.
