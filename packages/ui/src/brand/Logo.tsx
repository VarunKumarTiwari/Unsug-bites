import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { color } from '../tokens/color';

// Brand strings — canonical values live in standards/brand.md. Web keeps a mirror
// (it can't import @unsung/ui). Keep all three in sync.
export const BRAND = {
  name: 'Shauni',
  tagline: 'Trust your gut, not the feed.',
} as const;

interface LogoProps {
  size?: number;
  /** Stroke color. Defaults to primary; pass color.surface for use on the brand red. */
  color?: string;
}

// Storefront + fork-and-spoon sign. Geometry mirrored in apps/web/.../logo.tsx —
// edit standards/brand.md and both files together.
export function Logo({ size = 64, color: stroke = color.primary.base }: LogoProps) {
  const common = { stroke, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={13} r={9} {...common} />
      <Path d="M25.5 7 V10 M27.5 7 V10 M29.5 7 V10" {...common} />
      <Path d="M25.5 10 H29.5 M27.5 10 V18" {...common} />
      <Ellipse cx={36.5} cy={9} rx={2.2} ry={3} {...common} />
      <Path d="M36.5 12 V18" {...common} />
      <Rect x={10} y={22} width={44} height={7} rx={3.5} {...common} />
      <Path d="M14 29 V53 M50 29 V53" {...common} />
      <Path d="M9 53 H55" {...common} />
      <Rect x={19} y={35} width={13} height={12} rx={2} {...common} />
      <Path d="M25.5 35 V47" {...common} />
      <Path d="M38 53 V40 a4 4 0 0 1 8 0 V53" {...common} />
      <Path d="M44 47 V49" {...common} />
    </Svg>
  );
}
