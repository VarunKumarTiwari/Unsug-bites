import { ImageResponse } from "next/og";
import { BRAND } from "@/components/ui/logo";

// Auto-wires <meta property="og:image"> + twitter image at build time — no static
// asset, no 404. Brand palette is hardcoded here because ImageResponse renders in an
// isolated context without access to the app's CSS variables (tokens live in globals.css).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND.name} — Discover Hidden-Gem Restaurants`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "#FDFCF7", // cream
          color: "#1C1C1E", // ink
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "#A92D1B" }} />
          <span style={{ fontSize: 28, letterSpacing: "0.08em", color: "#1C1C1EBF" }}>
            {BRAND.name.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          {BRAND.tagline}
        </div>
        <div style={{ fontSize: 32, color: "#1C1C1EBF", marginTop: 32, maxWidth: 820 }}>
          Hidden-gem restaurants, scanned dishes, honest reviews.
        </div>
      </div>
    ),
    { ...size }
  );
}
