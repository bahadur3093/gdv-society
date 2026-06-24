import "server-only";
import { prisma } from "@/lib/prisma";

export type TokenValidationResult =
  | {
      valid: true;
      userId: string;
      userEmail: string;
      userName: string;
      requestId: string;
    }
  | {
      valid: false;
      reason: "not_found" | "expired" | "used" | "no_user";
    };

/**
 * Validate a password reset token.
 *
 * Checks:
 * • Token exists in DB
 * • Token hasn't expired
 * • Token hasn't been used
 * • Associated user still exists
 *
 * @param token The token string from the URL
 * @returns Validation result with user info if valid
 */
export async function validateResetToken(
  token: string,
): Promise<TokenValidationResult> {
  if (!token || token.length < 16) {
    return { valid: false, reason: "not_found" };
  }

  const resetRequest = await prisma.passwordResetRequest.findFirst({
    where: { token },
    select: {
      id: true,
      userId: true,
      status: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          accountStatus: true,
        },
      },
    },
  });

  if (!resetRequest) {
    return { valid: false, reason: "not_found" };
  }

  if (!resetRequest.user) {
    return { valid: false, reason: "no_user" };
  }

  // Check expiration
  if (resetRequest.expiresAt < new Date()) {
    return { valid: false, reason: "expired" };
  }

  // Check status (must be APPROVED, not COMPLETED/EXPIRED)
  if (resetRequest.status !== "APPROVED") {
    return {
      valid: false,
      reason: resetRequest.status === "COMPLETED" ? "used" : "expired",
    };
  }

  return {
    valid: true,
    userId: resetRequest.user.id,
    userEmail: resetRequest.user.email,
    userName: resetRequest.user.name,
    requestId: resetRequest.id,
  };
}

/**
 * Mark a token as used (call after successful password reset).
 * Single-use enforcement.
 */
export async function markTokenUsed(requestId: string): Promise<void> {
  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: "COMPLETED" },
  });
}
