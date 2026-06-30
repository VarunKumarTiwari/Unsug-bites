import { cn } from "@/lib/utils";

// Web mirror of @unsung/ui brand exports. Web can't import @unsung/ui (it bundles
// React Native), so the canonical geometry + strings (standards/brand.md) are
// duplicated here. Edit standards/brand.md and packages/ui/src/brand/* in lockstep.
export const BRAND = {
  name: "Shauni",
  tagline: "Trust your gut, not the feed.",
} as const;

interface LogoProps {
  size?: number;
  /** Tailwind text-color class — the SVG strokes use currentColor. */
  className?: string;
}

// Storefront + fork-and-spoon sign. Marketing graphic → inline SVG allowed per AGENTS.md.
export function Logo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <circle cx={32} cy={13} r={9} />
      <path d="M25.5 7 V10 M27.5 7 V10 M29.5 7 V10" />
      <path d="M25.5 10 H29.5 M27.5 10 V18" />
      <ellipse cx={36.5} cy={9} rx={2.2} ry={3} />
      <path d="M36.5 12 V18" />
      <rect x={10} y={22} width={44} height={7} rx={3.5} />
      <path d="M14 29 V53 M50 29 V53" />
      <path d="M9 53 H55" />
      <rect x={19} y={35} width={13} height={12} rx={2} />
      <path d="M25.5 35 V47" />
      <path d="M38 53 V40 a4 4 0 0 1 8 0 V53" />
      <path d="M44 47 V49" />
    </svg>
  );
}

// Full-screen boot/loading state. Pulse is gated behind motion-safe: so it
// respects prefers-reduced-motion. Mirror of @unsung/ui LoadingScreen.
export function LoadingScreen({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-candlelit px-8 text-center text-cream">
      <Logo size={88} className="text-cream motion-safe:animate-pulse" />
      <span
        className="mt-6 font-heading text-4xl font-semibold"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {BRAND.name}
      </span>
      {tagline && (
        <span className="mt-1 text-base text-cream/85">{BRAND.tagline}</span>
      )}
    </div>
  );
}
