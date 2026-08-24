// Real HTTP client for the backend. Every service client goes through apiFetch;
// each wraps it with withMock() so a failed call falls back to its bundled mock
// and the UI never breaks while the backend is still stabilizing.

import { getAccessToken } from '@/lib/store/auth';

const BASE =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://unsung-bites-api.onrender.com';

// EXPO_PUBLIC_USE_MOCK=1 → never hit the network, always use the mock.
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiInit extends Omit<RequestInit, 'body'> {
  body?: unknown; // JSON-serialized unless it's FormData
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = init;

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    // Let the platform set multipart boundary for FormData.
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string> | undefined),
  };

  const token = getAccessToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...rest,
      headers: finalHeaders,
      signal: controller.signal,
      body: body == null ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiError(`Network error for ${path}: ${(e as Error).message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new ApiError(`${res.status} for ${path}`, res.status);
  }

  // 204 / empty body → null; callers that expect a body will treat it as failure upstream.
  const text = await res.text();
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(`Malformed JSON from ${path}`);
  }
}

// Try the live call; on any failure (or forced mock mode) return the mock.
export async function withMock<T>(
  label: string,
  live: () => Promise<T>,
  mock: () => T,
): Promise<T> {
  if (USE_MOCK) return mock();
  try {
    return await live();
  } catch (e) {
    console.warn(`[api] ${label} fell back to mock: ${(e as Error).message}`);
    return mock();
  }
}
