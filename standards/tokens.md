# Design Tokens

Single source: `packages/ui/src/tokens/`. All consumers import from `@unsung/ui` — never deep paths, never raw values.

```ts
import { color, space, radius, shadow, text, spring, duration, easing } from '@unsung/ui';
```

## Colors (semantic)

Two-layer system: `palette` is raw values (private), `color` is semantic roles (the only public surface). Re-themes (dark mode, alt brand) swap the role map; palette stays the same.

| Token | Use |
|---|---|
| `color.bg` | Page background |
| `color.surface` | Cards, sheets, modals, overlays |
| `color.surfaceMuted` | Filled muted backgrounds — chip bg, skeleton, secondary buttons |
| `color.text.base` | Primary text, active icons |
| `color.text.muted` | Secondary text, captions |
| `color.text.subtle` | Placeholder, disabled, inactive icons |
| `color.border` | Hairlines, card edges, dividers |
| `color.primary.base` | CTAs, streak, hidden gem, active tint |
| `color.primary.soft` | Brand-tinted backgrounds |
| `color.success.base` | Verified, nutrition positive |
| `color.success.soft` | Success-tinted backgrounds |
| `color.shadow` | Card shadow base |

## Spacing

`space.xs` 4 · `space.sm` 8 · `space.md` 16 · `space.lg` 24 · `space.xl` 32 · `space.xxl` 48

## Border radius

`radius.sm` 8 · `radius.md` 14 · `radius.lg` 22 · `radius.xl` 28 · `radius.pill` 999

## Typography

Bundled variants — each entry contains family + size + lineHeight (and casing for `label`). The variant fully describes the type style. Never combine a variant with a separate weight prop.

| Variant | Family | Size | Use |
|---|---|---|---|
| `display` | Fraunces 600 | 34 | Hero titles |
| `h1` | Fraunces 500 | 28 | Screen titles |
| `h2` | Fraunces 500 | 22 | Section headings |
| `h3` | Inter 600 | 18 | Sans subheadings |
| `h3Serif` | Fraunces 500 | 18 | Serif subheadings |
| `body` | Inter 400 | 15 | Default body |
| `bodyMedium` | Inter 500 | 15 | Body emphasis |
| `bodyStrong` | Inter 600 | 15 | Body strong (button labels) |
| `bodySerif` | Fraunces 600 | 15 | Serif body (dish names) |
| `small` | Inter 400 | 13 | Captions |
| `smallMedium` | Inter 500 | 13 | Caption emphasis |
| `smallStrong` | Inter 600 | 13 | Caption strong |
| `label` | Inter 500 | 11 | Eyebrows, uppercase, +0.6 ls |
| `labelStrong` | Inter 600 | 11 | Eyebrow strong |

Use `<Text variant="..." tone="..." />`. No `weight`, no `serif` — pick the variant that already encodes them.

## Shadows

`shadow.card` — standard card lift (elevation 4)
`shadow.pin` — accent-colored map pin glow (elevation 6)

## Motion

See `standards/animations.md`. Springs: `spring.gentle / snappy / bouncy`. Durations: `duration.micro / fast / base / slow / ambient`. Easings: `easing.out / in`.
