import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { color, fonts, fontSize } from '@/theme/tokens';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label';
type Tone = 'ink' | 'muted' | 'subtle' | 'accent' | 'olive' | 'surface';
type Weight = 'regular' | 'medium' | 'semibold';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: Weight;
  serif?: boolean;
}

const TONE: Record<Tone, string> = {
  ink: color.ink,
  muted: color.inkMuted,
  subtle: color.inkSubtle,
  accent: color.accent,
  olive: color.olive,
  surface: color.surface,
};

export function Text({
  variant = 'body',
  tone = 'ink',
  weight = 'regular',
  serif,
  style,
  ...rest
}: Props) {
  const family =
    serif || variant === 'display' || variant === 'h1' || variant === 'h2'
      ? variant === 'display'
        ? fonts.display
        : fonts.heading
      : weight === 'semibold'
      ? fonts.bodySemi
      : weight === 'medium'
      ? fonts.bodyMed
      : fonts.body;

  return (
    <RNText
      style={[
        {
          color: TONE[tone],
          fontFamily: family,
          fontSize: fontSize[variant],
          letterSpacing: variant === 'label' ? 0.6 : 0,
          textTransform: variant === 'label' ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    />
  );
}
