/**
 * Smart app link: tries to open the installed mobile app via the
 * custom URL scheme; falls back to the appropriate app store when the
 * app isn't installed.
 *
 * Why this file exists: the landing page's "Download" CTAs need to
 * Do The Right Thing whether the visitor is on desktop, on mobile
 * with the app installed, or on mobile without it.
 *
 * Universal Links / App Links are the long-term fix (see
 * docs/DEPLOY.md) but require the app to be published first.
 */

export type Platform = "ios" | "android" | "desktop";

const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME ?? "unsung";
const IOS_STORE =
  process.env.NEXT_PUBLIC_IOS_APP_URL ??
  "https://apps.apple.com/app/idTODO";
const ANDROID_STORE =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ??
  "https://play.google.com/store/apps/details?id=com.unsung.bites";

export function detectPlatform(userAgent: string): Platform {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function storeUrlFor(platform: Platform): string {
  return platform === "android" ? ANDROID_STORE : IOS_STORE;
}

/**
 * Build a deep link into the app. Path is optional — defaults to root.
 * Example: deepLink("/dish/123") → "unsung:///dish/123"
 */
export function deepLink(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${APP_SCHEME}://${normalized}`;
}

/**
 * Attempt to open the mobile app. If the app isn't installed, fall back
 * to the platform's app store.
 *
 * TODO — fallback timing strategy. This is the heart of the smart link.
 *
 * The mechanic: assign `window.location` to a custom scheme URL. If the
 * app is installed, the OS intercepts and the page is hidden/backgrounded
 * before any fallback fires. If it isn't installed, nothing happens
 * visibly and we need to redirect to the store.
 *
 * There are two reasonable strategies:
 *
 *   (A) Time-based: setTimeout(~1500ms) → redirect to store. Simple but
 *       can briefly flash the store on slow devices even when the app
 *       opens correctly.
 *
 *   (B) Visibility-aware: same timeout, but cancel it if
 *       document.visibilityState becomes "hidden" (= OS backgrounded the
 *       tab to open the app). More reliable, slightly more code.
 *
 * Implement openApp() below. Inputs are already wired up — you decide
 * how the race plays out.
 */
export function openApp(opts: { platform: Platform; path?: string }): void {
  const { platform, path = "/" } = opts;
  // Desktop -> Expo web export at /app. Mobile -> platform store.
  // ponytail: post-launch, swap the mobile branch for a visibility-aware deep
  // link (setTimeout + visibilitychange) once the app is on the stores.
  if (platform === "desktop") {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    window.location.href = `/app${normalized === "/" ? "" : normalized}`;
    return;
  }
  window.location.href = storeUrlFor(platform);
}
