import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Simple In-memory Rate Limiter
type RateLimitRecord = { count: number; lastReset: number };
const globalTracker: RateLimitRecord = { count: 0, lastReset: Date.now() };
const userTracker = new Map<string, RateLimitRecord>();

const GLOBAL_LIMIT = 100;
const FREE_USER_LIMIT = 20;
const PRO_USER_LIMIT = 100;
const RESET_INTERVAL = 60000; // 1 minute

function isRateLimited(id: string, limit: number, tracker: Map<string, RateLimitRecord> | RateLimitRecord): boolean {
  const now = Date.now();
  const record = (tracker instanceof Map) 
    ? tracker.get(id) || { count: 0, lastReset: now } 
    : tracker;

  if (now - record.lastReset > RESET_INTERVAL) {
    record.count = 1;
    record.lastReset = now;
    if (tracker instanceof Map) tracker.set(id, record);
    return false;
  }

  if (record.count >= limit) return true;

  record.count++;
  if (tracker instanceof Map) tracker.set(id, record);
  return false;
}

const isPublicRoute = createRouteMatcher([
  '/',                       // Direct root
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)', // Locale roots
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)/about(.*)',
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)/contact(.*)',
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)/pricing(.*)',
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)/sign-in(.*)',
  '/(en|ja|ko|es|fr|de|zh|zh-TW|pt|ar|it|id)/sign-up(.*)',
  '/sign-in(.*)',            // Fallback unlocalized
  '/sign-up(.*)',            // Fallback unlocalized
  '/api/stripe/webhook(.*)',
  '/api/kra/debug(.*)',
  '/api/kra/check-pin(.*)',
  '/api/kra/check-pin-by-pin(.*)',
  '/api/admin/setup(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Global Rate Limit Check
  if (isRateLimited('global', GLOBAL_LIMIT, globalTracker)) {
    console.warn(`[PROXY] Global rate limit reached: ${req.nextUrl.pathname}`);
    return NextResponse.json({ error: 'Server Busy. Please wait a moment.' }, { status: 429 });
  }

  // 2. User/IP Rate Limit Check
  const { userId, sessionClaims } = await auth();
  const ident = userId || req.headers.get('x-forwarded-for') || 'anon';
  
  // Rate Limit Exemption for Admins
  const isAdmin = (sessionClaims as any)?.publicMetadata?.role === 'admin';
  const isPro = (sessionClaims as any)?.publicMetadata?.subscriptionStatus === 'active' || isAdmin;
  const userLimit = isPro ? PRO_USER_LIMIT : FREE_USER_LIMIT;

  if (!isAdmin && isRateLimited(ident, userLimit, userTracker)) {
    console.warn(`[PROXY] Rate limit reached for ${ident}: ${req.nextUrl.pathname}`);
    return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 });
  }

  const isPublic = isPublicRoute(req);
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isApiRoute) {
    if (!isPublic && !req.nextUrl.pathname.startsWith('/api/kra')) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // Handle Public vs Protected page routes
  if (!isPublic && !userId) {
    const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
    const locale = (pathParts[0] && routing.locales.includes(pathParts[0] as any)) ? pathParts[0] : routing.defaultLocale;
    
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const response = await intlMiddleware(req);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|m?js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
