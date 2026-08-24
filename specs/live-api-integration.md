# Live API Integration

## Objective
The mobile app currently reads every screen's data from local JSON mocks in `apps/mobile/lib/mock/`, served through per-service client functions in `apps/mobile/lib/api/*.ts` that fake network latency. The backend (Kotlin/Spring Boot) is now deployed and live at `https://unsung-bites-api.onrender.com` with the seven OpenAPI-specced services (discovery, scan, nutrition, reviews, gamification, users, recommendations). This work replaces the fake-latency mock seam with a single real HTTP client (`apiFetch`) so the app consumes real backend data — while keeping a per-service mock fallback so the app never breaks white the backend is still unstable (public `/restaurants/nearby` currently 500s, auth-gated endpoints 401). Existing client signatures stay identical; screens are not touched.

## Requirements
R1. Add `apiFetch(path, init?)` in `apps/mobile/lib/api/` that prepends the base URL from `EXPO_PUBLIC_API_URL` (default `https://unsung-bites-api.onrender.com`), sets `Content-Type: application/json`, attaches an `Authorization: Bearer <token>` header when an access token is available, parses the JSON body, and throws a typed error on non-2xx responses.
R2. `apiFetch` attaches the Supabase access token when one exists in the auth store; when no token exists it sends the request unauthenticated (correct for the public discovery endpoints, and lets the mock fallback cover the auth-gated ones).
R3. Each service client in `apps/mobile/lib/api/*.ts` calls the real endpoint via `apiFetch` using the path from that service's `services/<name>/openapi.yaml`:
  - discovery: `GET /restaurants/nearby?lat&lng`, `GET /restaurants/{id}`
  - scan: `POST /scan`
  - nutrition: `GET /nutrition/{lookupKey}`
  - reviews: `GET /reviews`, `POST /reviews`
  - gamification: `GET /gamification/{userId}`
  - users: `GET /users/{id}` (getMe → the current user's id)
  - recommendations: `GET /recommendations/{userId}`
R4. Every client keeps its existing exported function name, parameters, and `Promise<T>` return type unchanged, so no screen or component import needs to change.
R5. Per-service mock fallback: when a real call fails (network error, non-2xx, or timeout), the client logs a warning and returns the existing mock JSON it returns today, so the UI still renders. A single env flag (`EXPO_PUBLIC_USE_MOCK=1`) forces mock-only mode without hitting the network.
R6. `reviews.submit` and `scan.submitScan` POST the real request body per the OpenAPI `ReviewInput` / scan schema; on success return the server response, on failure fall back to the current synthesized/mock result (so review submission never hard-fails the UI).
R7. Requests time out (default ~8s, scan ~20s) via `AbortController` so a hung backend falls back to mock instead of hanging the screen.
R8. `_latency.ts` fake-latency is removed from the live path (real network is the latency); it may remain only as a helper used by the mock-fallback branch if desired.
R9. `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_USE_MOCK` are documented (README or `.env.example`) and read at runtime, not hardcoded.

## Constraints
- Stack: Expo / React Native (TypeScript), existing `@unsung/contracts` types, `zustand` auth store. No new heavy dependencies — use the platform `fetch` and `AbortController`.
- The seam stays exactly at `apps/mobile/lib/api/`. Screens, components, and `@unsung/contracts` are NOT modified.
- Base URL and mock flag come from `EXPO_PUBLIC_*` env vars, never hardcoded literals in client bodies (aside from the documented default fallback).
- **Out of scope:** building real Supabase sign-in / session management. The auth store (`lib/store/auth.ts`) is a stub with no token today; this spec reads a token *if present* and otherwise runs unauthenticated + mock fallback. Wiring `@supabase/supabase-js` and real login is a separate spec.
- **Out of scope:** fixing the backend (the 500 on `/restaurants/nearby` is a backend bug). App-side only.
- No changes to the `services/*/openapi.yaml` files.

## Edge Cases
- Backend returns 500/502 (currently the case for `/restaurants/nearby`) → fall back to mock, warn, UI renders.
- Backend returns 401 (auth-gated endpoint, no token) → fall back to mock.
- Request hangs / Render cold-start slow → AbortController timeout → mock fallback.
- Backend returns 200 with an empty array (seeded-but-empty DB) → return the empty array as-is (do NOT treat empty as failure; only errors fall back to mock).
- `getRestaurant(id)` for an id not present in the backend → 404 → mock fallback preserves today's "synthesize from nearby list" behavior.
- Malformed JSON body on a 200 → treat as failure → mock fallback.
- `EXPO_PUBLIC_USE_MOCK=1` → never hit the network at all.
- Missing `EXPO_PUBLIC_API_URL` → use the documented default so the app still works out of the box.

## Definition of Done
- [ ] `apiFetch` exists, prepends `EXPO_PUBLIC_API_URL` (with default), sets JSON headers, timeouts via AbortController, throws typed error on non-2xx. (R1, R7)
- [ ] `apiFetch` attaches `Authorization: Bearer <token>` only when a token is present. (R2)
- [ ] All seven service clients call their real OpenAPI endpoint through `apiFetch`. (R3)
- [ ] Every exported client function keeps its original name/params/return type; no screen import changed. (R4)
- [ ] Each client falls back to its existing mock on failure and logs a warning; `EXPO_PUBLIC_USE_MOCK=1` forces mock-only. (R5)
- [ ] `reviews.submit` and `scan.submitScan` POST real bodies and fall back on failure. (R6)
- [ ] Empty-array 200 responses pass through unchanged (not treated as failure). (edge case)
- [ ] Fake `fakeLatency` no longer runs on the live network path. (R8)
- [ ] `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_USE_MOCK` documented in `.env.example`/README. (R9)
- [ ] App builds and runs; with backend live, discovery data comes from the API (or falls back cleanly when it 500s).
