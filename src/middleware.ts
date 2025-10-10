import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    // For dashboard routes, let the layout handle authentication
    // This prevents redirect loops between middleware and layout
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For dashboard routes, always allow (layout will handle auth)
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return true;
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