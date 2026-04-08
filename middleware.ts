import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting (sliding window)
// Note: This resets on cold starts/deployments on Vercel.
const store = new Map<string, { count: number; resetAt: number }>();

// Route group limits: [maxRequests, windowSeconds]
const ROUTE_GROUPS: Record<string, [number, number]> = {
  '/api/user': [60, 60],
  '/api/admin': [120, 60],
  '/api/ai': [10, 60],
  '/api/kra': [30, 60],
  'default': [100, 60],
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip webhooks and internal health checks if necessary
  if (pathname.includes('/webhook') || pathname.includes('/health')) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  
  // Find matching route group
  let groupKey = 'default';
  for (const key of Object.keys(ROUTE_GROUPS)) {
    if (pathname.startsWith(key)) {
      groupKey = key;
      break;
    }
  }

  const [maxRequests, windowSeconds] = ROUTE_GROUPS[groupKey];
  const key = `${ip}:${groupKey}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window or expired
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return NextResponse.next();
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please slow down.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count++;
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
  
  return response;
}

// Ensure middleware only runs locally on relevant routes to save execution time
export const config = {
  matcher: '/api/:path*',
};
