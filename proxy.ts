import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/',                 // Root landing redirects to locale
  '/:locale',          // Home page
  '/:locale/about(.*)', 
  '/:locale/contact(.*)',
  '/:locale/pricing(.*)',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/api/stripe/webhook(.*)',
  '/api/kra/debug(.*)',
  '/api/kra/check-pin(.*)',
  '/api/kra/check-pin-by-pin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  console.log(`[PROXY] Handling ${req.nextUrl.pathname}`);
  const publicRoute = isPublicRoute(req);
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  // 1. Handle API routes - Skip localization entirely
  if (isApiRoute) {
    console.log(`[PROXY] API Route detected: ${req.nextUrl.pathname}`);
    
    // Defensive check: If it's a KRA API route, we treat it as public for the dashboard
    const isKraApi = req.nextUrl.pathname.startsWith('/api/kra');
    
    if (!publicRoute && !isKraApi) {
      try {
        await auth.protect();
      } catch (authErr) {
        console.error(`[PROXY] Auth failure on API route ${req.nextUrl.pathname}:`, authErr);
        // If auth fails on an API route, returning a JSON 401 is better than a 307 redirect
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const response = NextResponse.next();
    // Use X-Content-Type-Options for safety, but avoid * CORS which conflicts with include-credentials
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // 2. Run next-intl middleware for all other routes
  console.log(`[PROXY] Running intlMiddleware for ${req.nextUrl.pathname}`);
  const response = await intlMiddleware(req);

  // 3. Apply authentication protection for non-public routes
  if (!publicRoute) {
    await auth.protect();
  }

  // 4. Set security headers
  // response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Standard security headers
  // response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});

export const config = {
  matcher: [
    // Standard Next.js matcher excluding internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|m?js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
