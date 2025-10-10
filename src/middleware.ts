import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    // Ensure proper redirect for dashboard access
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      // If user is authenticated, allow access
      if (req.nextauth.token) {
        return NextResponse.next();
      }
      // If not authenticated, redirect to signin with callback URL
      const signInUrl = new URL('/auth/signin', req.url);
      // Preserve full intended URL (pathname + search) for proper post-login redirect
      const fullDestination = req.nextUrl.pathname + (req.nextUrl.search || '');
      signInUrl.searchParams.set('callbackUrl', fullDestination);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to dashboard if token exists
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        // For other protected routes, check token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"]
};