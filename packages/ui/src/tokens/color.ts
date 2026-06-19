// Two-layer color system:
//   palette → raw hex/rgba values, never imported by app code
//   color   → semantic roles, the only export consumed by components
// To re-theme (dark mode, alt brand) swap the `color` map. Palette stays.

const palette = {
  alabasterCream: '#FDFCF7',
  white:          '#FFFFFF',
  charcoal:       '#1C1C1E',
  charcoal60:     'rgba(28,28,30,0.6)',
  charcoal40:     'rgba(28,28,30,0.4)',
  charcoal06:     'rgba(28,28,30,0.06)',
  sunDriedTomato: '#A92D1B',
  tomato08:       'rgba(169,45,27,0.08)',
  warmOlive:      '#5A684D',
  olive10:        'rgba(90,104,77,0.10)',
  stoneGray:      '#EFECE6',
} as const;

export const color = {
  bg:           palette.alabasterCream,
  surface:      palette.white,
  surfaceMuted: palette.stoneGray,

  text: {
    base:   palette.charcoal,
    muted:  palette.charcoal60,
    subtle: palette.charcoal40,
  },

  border: palette.stoneGray,

  primary: {
    base: palette.sunDriedTomato,
    soft: palette.tomato08,
  },

  success: {
    base: palette.warmOlive,
    soft: palette.olive10,
  },

  shadow: palette.charcoal06,
} as const;
