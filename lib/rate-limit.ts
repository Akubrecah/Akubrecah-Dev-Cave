/**
 * Global Sliding-Window Rate Limiter
 * Usage: call `rateLimit(req)` at the top of any API route handler.
 * Returns a 429 NextResponse when exceeded, or null when allowed.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — resets on cold start, suitable for Vercel serverless
const store = new Map<string, RateLimitEntry>();

// Route-group limits: [maxRequests, windowSeconds]
const ROUTE_LIMITS: [RegExp, number, number][] = [
  [/^\/api\/ai\//,      10,  60],   // AI routes: tight (expensive)
  [/^\/api\/kra\//,     30,  60],   // KRA routes: expanded to 30
  [/^\/api\/payments/,  20,  60],   // Payment routes: tight
  [/^\/api\/stripe\//,   30,  60],  // Stripe webhooks/checkout
  [/^\/api\/admin\//,   120, 60],   // Admin: generous
  [/^\/api\/user\//,    60,  60],   // User routes: standard
  [/^\/api\//,          100, 60],   // All other API routes
];

function getLimit(pathname: string): [number, number] {
  for (const [pattern, max, window] of ROUTE_LIMITS) {
    if (pattern.test(pathname)) return [max, window];
  }
  return [100, 60];
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

/**
 * Call at the top of any API route.
 * @returns NextResponse with 429 status if rate limit exceeded, otherwise null.
 */
export function rateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
  const [maxRequests, windowSeconds] = getLimit(pathname);

  // Group by IP + first two path segments (e.g. /api/user)
  const group = '/' + pathname.split('/').slice(1, 3).join('/');
  const key = `${ip}:${group}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests. Please slow down.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Helper: gets remaining requests for a given IP + pathname.
 * Useful for adding X-RateLimit-Remaining headers to successful responses.
 */
export function getRateLimitInfo(req: NextRequest): {
  remaining: number;
  limit: number;
  resetAt: number;
} {
  const ip = getClientIp(req);
  const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
  const [maxRequests] = getLimit(pathname);
  const group = '/' + pathname.split('/').slice(1, 3).join('/');
  const key = `${ip}:${group}`;
  const entry = store.get(key);

  if (!entry || Date.now() >= entry.resetAt) {
    return { remaining: maxRequests, limit: maxRequests, resetAt: 0 };
  }

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    limit: maxRequests,
    resetAt: entry.resetAt,
  };
}
