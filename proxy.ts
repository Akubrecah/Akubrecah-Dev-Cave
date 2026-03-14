import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',                 // Landing page
  '/about(.*)',        // About page
  '/contact(.*)',      // Contact page
  '/pricing(.*)',      // Pricing page
  '/sign-in(.*)',      // Clerk sign-in
  '/sign-up(.*)',      // Clerk sign-up
  '/api/stripe/webhook(.*)' // Stripe webhooks must be public
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
