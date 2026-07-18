import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/widget(.*)',
  '/api/chat',
  '/api/widget/config',
  '/api/webhooks(.*)',
  '/login(.*)',
  '/register(.*)',
  '/api/health',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclude Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|woff2?|ico|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
