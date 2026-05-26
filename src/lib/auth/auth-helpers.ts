import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { HttpStatus } from '@/types';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = HttpStatus.UNAUTHORIZED
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Require authentication for API routes
 * @throws {AuthError} If user is not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new AuthError('Authentication required', HttpStatus.UNAUTHORIZED);
  }

  return session.user;
}

/**
 * Require admin role for API routes
 * @throws {AuthError} If user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    throw new AuthError('Admin access required', HttpStatus.FORBIDDEN);
  }

  return user;
}

/**
 * Require ownership or admin role for API routes
 * @param resourceUserId - The user ID of the resource owner
 * @throws {AuthError} If user is not authenticated, not the owner, and not an admin
 */
export async function requireOwnershipOrAdmin(resourceUserId: string) {
  const user = await requireAuth();

  if (user.id !== resourceUserId && user.role !== 'ADMIN') {
    throw new AuthError(
      'Access denied. You must be the owner or an admin.',
      HttpStatus.FORBIDDEN
    );
  }

  return user;
}
