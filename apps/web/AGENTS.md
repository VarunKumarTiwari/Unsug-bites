<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-token-rules -->
# Design Token Enforcement (Web)

This project shares a design system with the React Native mobile app (`packages/ui`).
To prevent drift, the web app follows strict token rules:

## Colors
- ALL colors must come from CSS variables defined in `src/app/globals.css` or from `@unsung/ui/tokens`.
- NO hardcoded hex, rgb, or hsl values in any component file.
- NO ad-hoc Tailwind arbitrary values like `bg-[#A92D1B]`.

## Icons
- ALL icons must come from `lucide-react` only.
- NO inline SVG icons in component files (landing page marketing graphics are the only exception).
- Use the same icon names as the mobile app (`lucide-react-native` on mobile → `lucide-react` on web).

## Typography
- Use `font-sans` (Inter) for body and UI text.
- Use `font-heading` (Fraunces) for display, headings, and brand moments.
- NO custom `font-family` declarations outside `layout.tsx` and `globals.css`.

## Spacing, Radius, Shadows
- Spacing: use `space-xs / sm / md / lg / xl / xxl` tokens (mapped to 4 / 8 / 16 / 24 / 32 / 48).
- Border radius: use `radius-sm / md / lg / xl / pill` tokens only.
- Shadows: use `shadow-card` or `shadow-pin` tokens only.

## Platform boundaries
- NEVER import `react-native`, `expo-*`, or any React Native dependency.
- NEVER import from `@unsung/ui` directly (it bundles RN primitives). Use `@unsung/ui/tokens` for design values.

## Shared packages (allowed imports)
- `@unsung/contracts` — shared TypeScript types
- `@unsung/api-client` — shared fetch layer
- `@unsung/ui/tokens` — design tokens only
<!-- END:design-token-rules -->
