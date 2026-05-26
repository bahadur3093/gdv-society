/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the request (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed flag and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // No entry or window expired - create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}