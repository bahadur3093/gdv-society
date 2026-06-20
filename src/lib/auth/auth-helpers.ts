import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { HttpStatus } from '@/types';

/**
 * Require authentication for API routes
 * Returns the authenticated session or throws an error response
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Authentication required',
      },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  return { session, user: session.user };
}

/**
 * Require admin role for API routes
 * Returns the authenticated admin session or throws an error response
 */
// export async function requireAdmin() {
//   const authResult = await requireAuth();

//   if (authResult instanceof NextResponse) {
//     return authResult;
//   }

//   const { session, user } = authResult;

//   if (user.role !== 'ADMIN') {
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Forbidden - Admin access required',
//       },
//       { status: HttpStatus.FORBIDDEN }
//     );
//   }

//   return { session, user };
// }

/**
 * Require ownership or admin role for API routes
 * Returns the authenticated session if user owns the resource or is admin
 */
export async function requireOwnershipOrAdmin(resourceUserId: string) {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { session, user } = authResult;

  if (user.role !== 'ADMIN' && user.id !== resourceUserId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden - You do not have permission to access this resource',
      },
      { status: HttpStatus.FORBIDDEN }
    );
  }

  return { session, user };
}
