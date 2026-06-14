// Design tokens — the only place colors, spacing, radii, fonts are defined.
// Tailwind config and runtime components both read from here.

export const color = {
  bg:        '#FDFCF7',  // Alabaster Cream — page background
  surface:   '#FFFFFF',  // Crisp White — cards, sheets
  ink:       '#1C1C1E',  // Charcoal — primary text, icons
  inkMuted:  'rgba(28,28,30,0.6)',
  inkSubtle: 'rgba(28,28,30,0.4)',
  accent:    '#A92D1B',  // Sun-Dried Tomato — CTAs, streak, hidden gem
  accentSoft:'rgba(169,45,27,0.08)',
  olive:     '#5A684D',  // Warm Olive — verified, nutrition green
  oliveSoft: 'rgba(90,104,77,0.10)',
  stone:     '#EFECE6',  // Stone Gray — borders, unselected
  shadow:    'rgba(28,28,30,0.06)',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  px: 1,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 40,
  8: 48,
  10: 64,
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold', // serif — logo, hero headings
  heading: 'Fraunces_500Medium',   // serif — restaurant names, sections
  body:    'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi:'Inter_600SemiBold',
} as const;

export const fontSize = {
  display:  34,
  h1:       28,
  h2:       22,
  h3:       18,
  body:     15,
  small:    13,
  label:    11,
} as const;

export const shadow = {
  card: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pin: {
    shadowColor: '#A92D1B',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
} as const;
