import crypto from 'crypto';

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a password reset token with expiry
 * @returns Object containing token and expiry timestamp
 */
export function generatePasswordResetToken(): {
  token: string;
  expiresAt: Date;
} {
  const token = generateToken();
  const expiryHours = parseInt(process.env.PASSWORD_RESET_EXPIRY || '3600', 10) / 3600;
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  return { token, expiresAt };
}

/**
 * Check if a token has expired
 * @param expiresAt - Expiry date of the token
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
