import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
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
  '/api/kra/debug(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const publicRoute = isPublicRoute(req);
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  // 1. Handle API routes - Skip localization
  if (isApiRoute) {
    if (!publicRoute) {
      await auth.protect();
    }
    const response = NextResponse.next();
    // Apply security headers
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return response;
  }

  // 2. Run next-intl middleware for all other routes
  const response = await intlMiddleware(req);

  // 3. Apply authentication protection for non-public routes
  if (!publicRoute) {
    await auth.protect();
  }

  // 4. Set security headers
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Standard security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});

export const config = {
  matcher: [
    // Standard Next.js matcher excluding internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
