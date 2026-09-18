import Image from "next/image";
import { cn } from "@/lib/utils";

// Web mirror of @unsung/ui brand exports. Web can't import @unsung/ui (it bundles
// React Native), so the canonical strings are duplicated here. The logo is now a
// raster gem mark (public/brand/mark*.png) generated from source art — keep the
// mobile Logo (packages/ui/src/brand/Logo.tsx) in lockstep.
export const BRAND = {
  name: "Unsung Bites",
  tagline: "Trust your gut, not the feed.",
} as const;

interface LogoProps {
  size?: number;
  /** "red" gem for light surfaces, "cream" gem for the brand-red background. */
  tone?: "red" | "cream";
  className?: string;
}

// Bitten-gem brand mark. Two color variants so it reads on both light (red gem)
// and brand-red (cream gem) surfaces.
export function Logo({ size = 64, tone = "red", className }: LogoProps) {
  return (
    <Image
      src={tone === "cream" ? "/brand/mark-cream.png" : "/brand/mark.png"}
      alt=""
      width={size}
      height={size}
      className={cn("text-primary", className)}
      aria-hidden="true"
    />
  );
}

// Full-screen boot/loading state. Pulse is gated behind motion-safe: so it
// respects prefers-reduced-motion. Mirror of @unsung/ui LoadingScreen.
export function LoadingScreen({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-candlelit px-8 text-center text-cream">
      <Logo size={88} tone="cream" className="motion-safe:animate-pulse" />
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
