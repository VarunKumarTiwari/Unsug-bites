# Auth Lives in the App (not the marketing site)

## Objective
Move **all** authentication out of the Next.js marketing site and into the
Expo app. The landing page (`unsungbites.com`) becomes pure marketing with
zero auth and zero Supabase. The app (`app.unsungbites.com` on web, + the
native builds from the App/Play stores) owns login, signup, OAuth, session,
and every logged-in surface.

This deletes the cross-domain token handoff entirely: users log in *inside*
the app, so the session is created where it's used. No `access_token` in a
URL, no `/splash` bridge.

## Why
- The **native** app can't use a Next.js `/login` page — an installed app opens
  cold with no web page in front of it. Auth must exist in the app regardless.
- Building login in Next *and* in Expo = two implementations, two OAuth
  wirings, two bug surfaces. Building it once (in the app) serves web-app users
  and native users identically.
- Marketing site with no logged-in state has no reason to hold a Supabase
  session → keep it a dumb, fast, cacheable static site.
- The app-side currently reads **no token at all** (no Supabase client in
  `apps/mobile`), so the existing web `/splash` → `openApp()?access_token=…`
  chain sends a token nothing consumes. We're choosing the architecture before
  app-auth is built — the cheapest possible moment.

## Architecture
```
unsungbites.com          Next.js — PURE marketing. No auth, no Supabase.
  [Open app] / [Login]   both just redirect into the app (openApp / app URL)

app.unsungbites.com      Expo web export — owns login + all logged-in UI
the app (native)         same Expo code, same login screen, from the stores
```
Subdomain (not subpath) chosen deliberately: two independent Vercel deploys,
avoids namespacing Expo's `output: "single"` SPA + its `/((?!_expo|assets).*)`
rewrite under a path prefix.

Same Supabase **project** across web-app and native (confirmed) — so the Expo
web client and native client share one auth backend. (Sessions are per-origin;
the native app keeps its own session storage. There is no shared-cookie
requirement because there is no cross-domain handoff anymore.)

## Requirements

### Marketing site (apps/web) — strip auth
1. R1: Delete the web login surface: `app/login/page.tsx`,
   `app/login/login-form.tsx`.
2. R2: Delete the handoff surface: `app/splash/page.tsx`,
   `app/splash/splash-launcher.tsx`, `app/auth/callback/route.ts`, and the
   spec `specs/post-login-splash.md` + `specs/supabase-login-page.md`.
3. R3: Delete Supabase from web: `lib/supabase/{client,server,env}.ts` and
   `middleware.ts` (it exists only to refresh the Supabase session). Remove
   `@supabase/ssr` (and `@supabase/supabase-js` if unused elsewhere) from
   `apps/web/package.json`.
4. R4: Repoint the two `/login` links in
   `components/ui/resizable-navbar.tsx` (lines ~107, ~161) to open the app's
   login instead of the deleted Next route (see R6).
5. R5: `lib/smartAppLink.ts` stays — it reverts to its original job (open the
   app / fall back to the store). Remove the `params` / `access_token` /
   `lat`/`lng` handoff logic from `openApp()`; keep platform detection, store
   fallback, and deep-link building. The existing param-free callers
   (`open-app-button.tsx`, `cinematic-landing-hero.tsx`, `resizable-navbar.tsx`)
   are already pure redirectors and keep working.
6. R6: Add a `WEB_APP_URL`-based "go to app login" target. `openApp()` already
   points all platforms at the Expo web deploy (`WEB_APP_URL`); the Login CTA
   opens the app at its login route (e.g. `${WEB_APP_URL}/login` or deep link
   `${APP_SCHEME}://login` on mobile). Reuse `openApp()` / `deepLink()`; do not
   hardcode a second app URL.
7. R7: Point `NEXT_PUBLIC_WEB_APP_URL` at `https://app.unsungbites.com` (env,
   not code). Keep the current Vercel default as fallback until DNS is live.

### App (apps/mobile) — build auth once
8. R8: Add a Supabase client for Expo (`@supabase/supabase-js`), configured to
   persist the session in the app's storage (AsyncStorage on native,
   localStorage on web) — NOT the SSR cookie client (that's web-server only).
9. R9: Port the login logic from the deleted `login-form.tsx`: email/password
   (`signInWithPassword`), magic link (`signInWithOtp`), and OAuth. The React
   logic (validation regex, pending states, error handling, toast) transfers;
   only the JSX becomes RN components (`@unsung/ui`).
10. R10: The app's existing `(onboarding)/splash.tsx` "Enable Location" flow
    stays as the *only* location prompt (native prompt, not browser). Login
    lands the user there or into `(tabs)` per existing routing.
11. R11: Gate the logged-in app surfaces on session presence inside the app
    (Expo Router), replacing the web middleware gate that R3 removes.

## Native OAuth caveat (bounded, real)
- Email/password + magic link: straightforward with `supabase-js`.
- Google/Apple on **native** needs `expo-auth-session` (or Supabase's native
  OAuth helper) + a deep-link redirect back into the app via the `shauni://`
  scheme — not `window.location`. On Expo **web** the browser redirect works
  like today.
- App Store rule: offering Google sign-in **requires** Apple Sign-In too. Plan
  both for the native build.

## Constraints
- Do not merge the two apps — two deployments, one domain family. Landing =
  Next, app = Expo web export, joined only by links/redirects.
- Reuse `@unsung/ui` primitives in the app; reuse `smartAppLink.ts` (extended,
  not duplicated) on the landing side.
- Same Supabase project for web-app and native.
- Scope OUT: merging codebases; SSR/cookie session sharing (not needed —
  no handoff); redesigning the login UI (port as-is, polish later).

## Definition of Done
- [ ] `unsungbites.com` has no `/login`, `/splash`, `/auth/*`, no
      `lib/supabase`, no `middleware.ts`, no `@supabase/*` deps. (R1–R3)
- [ ] Landing page builds and renders; Open-app and Login CTAs both route into
      the app. (R4–R6)
- [ ] `smartAppLink.ts` has no token/coords handoff logic; param-free callers
      still work. (R5)
- [ ] App has a working Supabase client with persisted session. (R8)
- [ ] App login screen supports email/password + magic link; OAuth wired for
      web, planned/stubbed for native with Apple Sign-In alongside Google. (R9)
- [ ] Location is prompted only in the app's onboarding splash. (R10)
- [ ] Logged-in app routes are gated inside the app. (R11)
- [ ] `app.unsungbites.com` DNS → Expo web deploy; `NEXT_PUBLIC_WEB_APP_URL`
      updated. (R7)

## Migration order (safe, reversible)
1. Build auth in the app first (R8–R11) so there's a working login before the
   web one is removed.
2. Stand up `app.unsungbites.com`, point `NEXT_PUBLIC_WEB_APP_URL` at it (R7).
3. Repoint landing Login CTA to the app (R4, R6).
4. Only then delete the web auth surface (R1–R3). Each step is a separate
   revertible commit.
```
