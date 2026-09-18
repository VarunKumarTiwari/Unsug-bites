import React from 'react';
import { Image } from 'react-native';

// Brand strings — canonical values live in standards/brand.md. Web keeps a mirror
// (it can't import @unsung/ui). Keep all three in sync.
export const BRAND = {
  name: 'Unsung Bites',
  tagline: 'Trust your gut, not the feed.',
} as const;

interface LogoProps {
  size?: number;
  /** 'red' gem for light surfaces, 'cream' gem for the brand-red background. */
  tone?: 'red' | 'cream';
}

// Bitten-gem brand mark. Raster art generated from source (mark*.png). Mirrored in
// apps/web/.../logo.tsx — edit standards/brand.md and both files together.
export function Logo({ size = 64, tone = 'red' }: LogoProps) {
  return (
    <Image
      source={tone === 'cream' ? require('./mark-cream.png') : require('./mark.png')}
      style={{ width: size, height: size, resizeMode: 'contain' }}
      accessibilityIgnoresInvertColors
    />
  );
}
