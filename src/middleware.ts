import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;

    // Redirect to sign in if user is not authenticated and accessing protected routes
    if (
      !token &&
      (pathname.startsWith('/orders') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/cart') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/profile'))
    ) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // If user is logged in but not an admin
    if (pathname.startsWith('/admin') && token?.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Match all relevant protected paths
export const config = {
  matcher: ['/orders', '/admin/:path*', '/cart', '/checkout', '/profile/:path*'],
};
