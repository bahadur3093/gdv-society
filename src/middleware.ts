// middleware.ts (at project root, sibling to app/)

import { auth, authConfig } from '@/lib/auth';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

export const { auth: middleware } = NextAuth(authConfig);

export default auth((req) => {
  const token = req.auth?.user;
  const isAuth = !!token;
  const { pathname, search } = req.nextUrl;

  // ─────────────────────────────────────────────────────────────
  //  Route categorization
  // ─────────────────────────────────────────────────────────────
  
  const isApiRoute = pathname.startsWith('/api');
  const isAuthPage = pathname.startsWith('/auth');
  const isCalculatorPage = pathname.startsWith('/maintenance-calculator');
  const isResidentPage = pathname.startsWith('/resident');
  const isAdminPage = pathname.startsWith('/admin');
  
  const isProtectedPage = isResidentPage || isAdminPage;
  const isVerificationPage = pathname === '/auth/verification-pending';

  // ─────────────────────────────────────────────────────────────
  //  1. API routes handle their own auth
  // ─────────────────────────────────────────────────────────────
  
  if (isApiRoute) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  //  2. Public routes — always allowed
  // ─────────────────────────────────────────────────────────────
  
  if (isCalculatorPage) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  //  3. Verification pending page — special case
  //     Authed (but unverified) users need to reach this page
  // ─────────────────────────────────────────────────────────────
  
  if (isVerificationPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    // Already verified? Send them to their dashboard
    if (token?.role === 'ADMIN' || token?.emailVerified) {
      return NextResponse.redirect(new URL(targetForRole(token), req.url));
    }
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  //  4. Unauthenticated user hitting a protected page
  //     → Redirect to signin, preserve return URL
  // ─────────────────────────────────────────────────────────────
  
  if (!isAuth && isProtectedPage) {
    const from = pathname + (search || '');
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('from', from);
    return NextResponse.redirect(signInUrl);
  }

  // ─────────────────────────────────────────────────────────────
  //  5. Authenticated user hitting an auth page
  //     → Bounce them to their dashboard
  // ─────────────────────────────────────────────────────────────
  
  if (isAuth && isAuthPage) {
    // Admins bypass verification check
    if (token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    
    // Unverified residents → verification pending
    if (!token?.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verification-pending', req.url));
    }
    
    // Verified residents → resident dashboard
    return NextResponse.redirect(new URL('/resident', req.url));
  }

  // ─────────────────────────────────────────────────────────────
  //  6. Email verification gate for protected routes
  //     Admins always have access; residents must be verified
  // ─────────────────────────────────────────────────────────────
  
  if (
    isAuth &&
    isProtectedPage &&
    token?.role !== 'ADMIN' &&
    !token?.emailVerified
  ) {
    return NextResponse.redirect(new URL('/auth/verification-pending', req.url));
  }

  // ─────────────────────────────────────────────────────────────
  //  7. Role gating — admins to /admin, residents to /resident
  // ─────────────────────────────────────────────────────────────
  
  // Resident trying to access admin routes
  if (isAdminPage && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/resident', req.url));
  }
  
  // Admin trying to access resident routes
  if (isResidentPage && token?.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // ─────────────────────────────────────────────────────────────
  //  9. Root path → send to role-specific home
  // ─────────────────────────────────────────────────────────────
  
  if (pathname === '/') {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    return NextResponse.redirect(new URL(targetForRole(token), req.url));
  }

  // ─────────────────────────────────────────────────────────────
  //  10. Everything else — pass through
  // ─────────────────────────────────────────────────────────────
  
  return NextResponse.next();
});

// ───────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────

function targetForRole(
  user: { role?: string } | null | undefined
): string {
  return user?.role === 'ADMIN' ? '/admin' : '/resident';
}

// ───────────────────────────────────────────────────────────────
//  Config
// ───────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register).*)"],
};
