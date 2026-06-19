import { Easing } from 'react-native-reanimated';

// Spring families — extracted from the home feed (the canonical animation reference).
// Use a named spring; never inline { damping, stiffness, mass }.
export const spring = {
  // Large surfaces: sheets, modals, screen entries.
  gentle: { damping: 22, stiffness: 200, mass: 1 },
  // Toggles, pills, list-item returns. Responsive but settled.
  snappy: { damping: 18, stiffness: 260, mass: 0.7 },
  // Press-release on chips and cards. Playful.
  bouncy: { damping: 9,  stiffness: 260, mass: 0.55 },
} as const;

// Duration buckets — match how timings cluster across the app today.
export const duration = {
  micro:   80,   // press compression
  fast:    150,  // quick fades, color shifts, dismissals
  base:    300,  // entry fades, slide-ins
  slow:    400,  // hero / section staggered entries
  ambient: 650,  // shimmer loops, ambient parallax
} as const;

// Two easings — entries ease out, exits ease in.
export const easing = {
  out: Easing.out(Easing.cubic),
  in:  Easing.in(Easing.cubic),
} as const;
