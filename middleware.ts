import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
    const isMaintenanceCalculator = req.nextUrl.pathname.startsWith('/maintenance-calculator');

    // Allow API routes to handle their own authentication
    if (isApiRoute) {
      return NextResponse.next();
    }

    // Allow public access to maintenance calculator
    if (isMaintenanceCalculator) {
      return NextResponse.next();
    }

    // Redirect to login if accessing protected page without authentication
    if (!isAuth && !isAuthPage) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      // Allow access to verification-pending page for unverified users
      if (req.nextUrl.pathname === '/auth/verification-pending') {
        return NextResponse.next();
      }
      
      // Admins always have access - redirect to dashboard
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      // For regular users, check if they are verified
      if (!token?.emailVerified) {
        // Unverified users should be redirected to verification pending page
        return NextResponse.redirect(new URL('/auth/verification-pending', req.url));
      }
      
      // Verified users can access dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // CRITICAL: Block unverified users from accessing dashboard and protected routes
    // Admins always have access (emailVerified is always set for admins)
    if (isAuth && isDashboardPage && token?.role !== 'ADMIN' && !token?.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verification-pending', req.url));
    }

    // Check admin access for admin pages
    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is used by middleware to check if user is authenticated
        // Return true to allow access, false to redirect to sign-in
        return true; // We handle authorization in the middleware function above
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};