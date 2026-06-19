import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { color } from '../tokens/color';
import { text, TextVariant } from '../tokens/typography';

type Tone = 'base' | 'muted' | 'subtle' | 'primary' | 'success' | 'surface';

interface Props extends TextProps {
  variant?: TextVariant;
  tone?: Tone;
}

const TONE: Record<Tone, string> = {
  base:    color.text.base,
  muted:   color.text.muted,
  subtle:  color.text.subtle,
  primary: color.primary.base,
  success: color.success.base,
  surface: color.surface,
};

export function Text({ variant = 'body', tone = 'base', style, ...rest }: Props) {
  const v = text[variant];
  return (
    <RNText
      style={[
        {
          color: TONE[tone],
          fontFamily: v.family,
          fontSize: v.size,
          lineHeight: v.lineHeight,
          ...('letterSpacing' in v ? { letterSpacing: v.letterSpacing } : null),
          ...('textTransform' in v ? { textTransform: v.textTransform } : null),
        },
        style,
      ]}
      {...rest}
    />
  );
}
