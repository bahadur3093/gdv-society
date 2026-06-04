import crypto from 'crypto';

/**
 * Generate a secure random token for password reset
 * @returns Random token string
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a token has expired
 * @param expiresAt - Expiration date of the token
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate token expiration date (24 hours from now)
 * @returns Expiration date
 */
export function getTokenExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt;
}
