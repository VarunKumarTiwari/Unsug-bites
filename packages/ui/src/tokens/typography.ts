// Bundled text variants. The <Text> primitive spreads one of these.
// Variant fully describes family + size + lineHeight + casing — never combine
// a variant with a weight prop; pick the variant that already encodes the weight.

const fontFamily = {
  serif:     'Fraunces_500Medium',
  serifBold: 'Fraunces_600SemiBold',
  sans:      'Inter_400Regular',
  sansMed:   'Inter_500Medium',
  sansSemi:  'Inter_600SemiBold',
} as const;

type LabelExtras = { letterSpacing: number; textTransform: 'uppercase' };

export const text = {
  display:      { family: fontFamily.serifBold, size: 34, lineHeight: 40 },
  h1:           { family: fontFamily.serif,     size: 28, lineHeight: 34 },
  h2:           { family: fontFamily.serif,     size: 22, lineHeight: 28 },
  h3:           { family: fontFamily.sansSemi,  size: 18, lineHeight: 24 },
  h3Serif:      { family: fontFamily.serif,     size: 18, lineHeight: 24 },

  body:         { family: fontFamily.sans,      size: 15, lineHeight: 22 },
  bodyMedium:   { family: fontFamily.sansMed,   size: 15, lineHeight: 22 },
  bodyStrong:   { family: fontFamily.sansSemi,  size: 15, lineHeight: 22 },
  bodySerif:    { family: fontFamily.serifBold, size: 15, lineHeight: 22 },

  small:        { family: fontFamily.sans,      size: 13, lineHeight: 18 },
  smallMedium:  { family: fontFamily.sansMed,   size: 13, lineHeight: 18 },
  smallStrong:  { family: fontFamily.sansSemi,  size: 13, lineHeight: 18 },

  label:        { family: fontFamily.sansMed,   size: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' } as { family: string; size: number; lineHeight: number } & LabelExtras,
  labelStrong:  { family: fontFamily.sansSemi,  size: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' } as { family: string; size: number; lineHeight: number } & LabelExtras,
} as const;

export type TextVariant = keyof typeof text;
