"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import PasswordResetEmail from "@/lib/email/PasswordResetEmail";
import { sendEmail } from "@/lib/email/resend";

export interface ForgotPasswordState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Email user submitted — shown on success state */
  email?: string;
  errors?: {
    email?: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    return (
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      headersList.get("cf-connecting-ip") ??
      null
    );
  } catch {
    return null;
  }
}

interface AuditEvent {
  event:
    | "password_reset_requested"
    | "password_reset_no_user"
    | "password_reset_rate_limited"
    | "password_reset_token_created";
  email: string;
  ip: string | null;
  reason?: string;
  userId?: string;
  token?: string;
}

function logAuditEvent(event: AuditEvent): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
}

// ─────────────────────────────────────────────────────────────
//  Secure token generator
// ─────────────────────────────────────────────────────────────

function generateToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const bytes = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

// ─────────────────────────────────────────────────────────────
//  Email format validation
// ─────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

// ─────────────────────────────────────────────────────────────
//  Forgot password action
// ─────────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const ip = await getClientIp();

  // ─── Basic validation ───
  if (!email) {
    return {
      status: "error",
      message: "Please enter your email",
      errors: { email: "Email is required" },
    };
  }

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address",
      errors: { email: "Invalid email format" },
    };
  }

  // ─── Rate limit check ───
  const rateLimit = checkRateLimit(email, ip);
  if (!rateLimit.allowed) {
    logAuditEvent({
      event: "password_reset_rate_limited",
      email,
      ip,
      reason: rateLimit.reason,
    });

    // Return generic success even when rate-limited
    // (prevents enumeration attack via rate limit responses)
    return {
      status: "success",
      email,
    };
  }

  try {
    // Always record attempt (counts against rate limit)
    recordFailedAttempt(email, ip);

    // Look up user (but don't reveal whether they exist)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
      },
    });

    // ─── User exists → generate token + log ───

    if (user) {
      // Skip if account is suspended (no resets allowed)
      if (user.accountStatus === "SUSPENDED") {
        logAuditEvent({
          event: "password_reset_no_user",
          email,
          ip,
          reason: "account_suspended",
        });
        // Still return success to prevent enumeration
        return { status: "success", email };
      }

      // Cancel any existing pending tokens for this user
      await prisma.passwordResetRequest.updateMany({
        where: {
          userId: user.id,
          status: "PENDING",
        },
        data: { status: "EXPIRED" },
      });

      // Also cancel any existing APPROVED tokens
      await prisma.passwordResetRequest.updateMany({
        where: {
          userId: user.id,
          status: "APPROVED",
        },
        data: { status: "EXPIRED" },
      });

      // Generate new token (32 chars, 24-hour expiry)
      const token = generateToken(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.passwordResetRequest.create({
        data: {
          userId: user.id,
          status: "APPROVED", // Auto-approved for self-service
          token,
          requestedAt: new Date(),
          approvedAt: new Date(),
          approvedBy: user.id,
          expiresAt,
        },
      });

      logAuditEvent({
        event: "password_reset_token_created",
        email,
        ip,
        userId: user.id,
        token: token.substring(0, 8) + "...", // partial token in logs only
      });

      // 🆕 Build reset URL
      const baseUrl = (
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      ).replace(/\/$/, "");
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      // 🆕 Send actual email via Resend
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Reset your GDV Society Hub password",
        react: PasswordResetEmail({
          userName: user.name,
          resetUrl,
          expiresInHours: 24,
        }),
      });

      if (!emailResult.success) {
        // Log failure but DON'T reveal to user (security)
        console.error(
          "[forgotPasswordAction] Email send failed:",
          emailResult.error,
        );

        // Fallback: log the reset link for manual sharing
        // (admin can grab from terminal if user reports not getting email)
        console.log(
          "\n" +
            "━".repeat(60) +
            "\n" +
            "⚠️  EMAIL SEND FAILED — manual fallback link\n" +
            "━".repeat(60) +
            "\n" +
            `   User:  ${user.email}\n` +
            `   Link:  ${resetUrl}\n` +
            "━".repeat(60) +
            "\n",
        );
      }
    } else {
      // No user found — log but don't reveal
      logAuditEvent({
        event: "password_reset_no_user",
        email,
        ip,
        reason: "user_not_found",
      });
    }

    // ─── ALWAYS return success ───
    // Whether user exists or not, response is identical
    return {
      status: "success",
      email,
    };
  } catch (error) {
    console.error("[forgotPasswordAction] failed", error);

    // Even on error, return success message
    // (Don't leak system state to attackers)
    return {
      status: "success",
      email,
    };
  }
}
