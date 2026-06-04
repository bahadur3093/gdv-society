import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { HttpStatus } from '@/types';

/**
 * Custom error class for authentication/authorization errors
 */
class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Get the current authenticated user from the session
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Require authentication - throws error if not authenticated
 * @returns The authenticated user
 * @throws AuthError if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AuthError('Unauthorized - Authentication required', HttpStatus.UNAUTHORIZED);
  }
  
  return user;
}

/**
 * Require admin role - throws error if not admin
 * @returns The authenticated admin user
 * @throws AuthError if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') {
    throw new AuthError('Forbidden - Admin access required', HttpStatus.FORBIDDEN);
  }
  
  return user;
}

/**
 * Require ownership or admin access
 * @param userId - The user ID to check ownership for
 * @returns The authenticated user
 * @throws AuthError if user is not authenticated, not the owner, and not an admin
 */
export async function requireOwnershipOrAdmin(userId: string) {
  const user = await requireAuth();
  
  // Allow if user is admin or owns the resource
  if (user.role !== 'ADMIN' && user.id !== userId) {
    throw new AuthError('Forbidden - You can only access your own resources', HttpStatus.FORBIDDEN);
  }
  
  return user;
}

// Export AuthError for use in other modules
export { AuthError };
