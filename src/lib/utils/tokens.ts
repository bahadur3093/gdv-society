import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token (default: 32 bytes)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a password reset token with expiration
 * @param expiryHours - Hours until token expires (default: 1 hour)
 * @returns Object with token and expiration date
 */
export function generatePasswordResetToken(expiryHours: number = 1): {
  token: string;
  expiresAt: Date;
} {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  return { token, expiresAt };
}

/**
 * Check if a token has expired
 * @param expiresAt - Expiration date of the token
 * @returns True if token has expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}