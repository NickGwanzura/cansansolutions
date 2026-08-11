/**
 * Simple in-memory rate limiter for auth endpoints.
 * In production with multiple replicas, replace this with a Redis-based limiter.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
};

/**
 * Check rate limit for a given key.
 *
 * @param key - Unique identifier (e.g. IP or combination of IP + route)
 * @param maxAttempts - Maximum allowed requests in the window (default 10)
 * @param windowSeconds - Time window in seconds (default 300 = 5 minutes)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowSeconds = 300,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired - reset
    store.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: windowSeconds };
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  const remaining = maxAttempts - entry.count;
  const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: true, remaining, resetInSeconds };
}
