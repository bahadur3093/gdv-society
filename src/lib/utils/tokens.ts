import crypto from 'crypto';

/**
 * Generate a secure random token for password reset
 * @param expirationHours - Number of hours until token expires (default: 1)
 * @returns Object containing the token and expiration date
 */
export function generatePasswordResetToken(expirationHours: number = 1): {
  token: string;
  expiresAt: Date;
} {
  // Generate a cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);
  
  return {
    token,
    expiresAt,
  };
}

/**
 * Generate a secure random verification token
 * @returns Verification token string
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random session token
 * @returns Session token string
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify if a token has expired
 * @param expiresAt - Expiration date of the token
 * @returns True if token has expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
