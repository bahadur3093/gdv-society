interface AttemptEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil: number | null;
}

// Two separate maps — different rules
const emailAttempts = new Map<string, AttemptEntry>();
const ipAttempts = new Map<string, AttemptEntry>();

// Limits (in milliseconds)
const EMAIL_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes after limit
};

const IP_LIMIT = {
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour after limit
};

// Clean up old entries every 10 minutes to prevent memory bloat
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const ENTRY_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanupTimer(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    cleanupExpiredEntries(emailAttempts, now);
    cleanupExpiredEntries(ipAttempts, now);
  }, CLEANUP_INTERVAL_MS);
}

function cleanupExpiredEntries(
  map: Map<string, AttemptEntry>,
  now: number,
): void {
  for (const [key, entry] of map.entries()) {
    if (now - entry.lastAttempt > ENTRY_TTL_MS) {
      map.delete(key);
    }
  }
}

/**
 * Check rate limits for both email and IP.
 * Call this BEFORE attempting authentication.
 *
 * @returns Object with status and remaining time if blocked
 */
export interface RateLimitResult {
  allowed: boolean;
  reason?: "email" | "ip";
  retryAfterMs?: number;
  retryAfterMinutes?: number;
}

export function checkRateLimit(
  email: string,
  ip: string | null,
): RateLimitResult {
  startCleanupTimer();
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const ipKey = ip ?? "unknown";

  // Check email block
  const emailEntry = emailAttempts.get(normalizedEmail);
  if (emailEntry?.blockedUntil && emailEntry.blockedUntil > now) {
    const retryAfterMs = emailEntry.blockedUntil - now;
    return {
      allowed: false,
      reason: "email",
      retryAfterMs,
      retryAfterMinutes: Math.ceil(retryAfterMs / 60_000),
    };
  }

  // Check IP block
  const ipEntry = ipAttempts.get(ipKey);
  if (ipEntry?.blockedUntil && ipEntry.blockedUntil > now) {
    const retryAfterMs = ipEntry.blockedUntil - now;
    return {
      allowed: false,
      reason: "ip",
      retryAfterMs,
      retryAfterMinutes: Math.ceil(retryAfterMs / 60_000),
    };
  }

  return { allowed: true };
}

/**
 * Record a failed authentication attempt.
 * Increments counters and may trigger blocks.
 */
export function recordFailedAttempt(email: string, ip: string | null): void {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const ipKey = ip ?? "unknown";

  // Update email entry
  incrementAttempt(emailAttempts, normalizedEmail, now, EMAIL_LIMIT);

  // Update IP entry
  incrementAttempt(ipAttempts, ipKey, now, IP_LIMIT);
}

function incrementAttempt(
  map: Map<string, AttemptEntry>,
  key: string,
  now: number,
  limit: typeof EMAIL_LIMIT,
): void {
  const existing = map.get(key);

  if (!existing) {
    map.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blockedUntil: null,
    });
    return;
  }

  // If outside the window, reset
  if (now - existing.firstAttempt > limit.windowMs) {
    map.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blockedUntil: null,
    });
    return;
  }

  // Increment count
  existing.count += 1;
  existing.lastAttempt = now;

  // Check if we should block
  if (existing.count >= limit.maxAttempts) {
    existing.blockedUntil = now + limit.blockDurationMs;
  }

  map.set(key, existing);
}

/**
 * Clear attempts for an email (call on successful auth).
 * Prevents legitimate users from being rate-limited after success.
 */
export function clearAttempts(email: string, ip: string | null): void {
  const normalizedEmail = email.toLowerCase().trim();
  emailAttempts.delete(normalizedEmail);
  if (ip) {
    ipAttempts.delete(ip);
  }
}

/**
 * Get current attempt count (for testing/debugging).
 */
export function getAttemptStats(
  email: string,
  ip: string | null,
): {
  emailAttempts: number;
  ipAttempts: number;
} {
  const normalizedEmail = email.toLowerCase().trim();
  return {
    emailAttempts: emailAttempts.get(normalizedEmail)?.count ?? 0,
    ipAttempts: ipAttempts.get(ip ?? "unknown")?.count ?? 0,
  };
}
