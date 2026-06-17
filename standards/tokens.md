# Design Tokens

Single source: `apps/mobile/theme/tokens.ts`. Import from there — never hardcode values.

## Colors

| Token | Value | Use |
|---|---|---|
| `color.bg` | `#FDFCF7` | Page background |
| `color.surface` | `#FFFFFF` | Cards, sheets, overlays |
| `color.ink` | `#1C1C1E` | Primary text, active icons |
| `color.inkMuted` | `rgba(28,28,30,0.6)` | Secondary text |
| `color.inkSubtle` | `rgba(28,28,30,0.4)` | Placeholder, disabled |
| `color.accent` | `#A92D1B` | CTAs, streak, hidden gem, active tint |
| `color.accentSoft` | `rgba(169,45,27,0.08)` | Accent backgrounds |
| `color.olive` | `#5A684D` | Nutrition, verified states |
| `color.oliveSoft` | `rgba(90,104,77,0.10)` | Nutrition chip backgrounds |
| `color.stone` | `#EFECE6` | Borders, dividers, unselected |
| `color.shadow` | `rgba(28,28,30,0.06)` | Card shadow base |

## Border radius

| Token | Value |
|---|---|
| `radius.sm` | 8 |
| `radius.md` | 14 |
| `radius.lg` | 22 |
| `radius.xl` | 28 |
| `radius.pill` | 999 |

## Typography

Fonts: Fraunces (serif display/headings) + Inter (body/labels).

| Variant | Size | Font |
|---|---|---|
| `display` | 34 | Fraunces 600 SemiBold |
| `h1` | 28 | Fraunces 500 Medium |
| `h2` | 22 | Fraunces 500 Medium |
| `h3` | 18 | Inter (or Fraunces when `serif` prop passed) |
| `body` | 15 | Inter 400 |
| `small` | 13 | Inter 400 |
| `label` | 11 | Inter 400, uppercase, letter-spacing 0.6 |

Use the `<Text>` primitive with `variant`, `tone`, `weight`, and `serif` props — never inline font styles.

## Shadows

```ts
shadow.card  — standard card lift (elevation 4)
shadow.pin   — accent-colored map pin glow (elevation 6)
```
