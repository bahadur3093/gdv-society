"use server";

import { signIn } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/auth/rate-limit";

export interface SigninState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Where to redirect after success */
  redirectTo?: string;
  /** Field-level errors (rare for signin) */
  errors?: {
    email?: string;
    password?: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  Helper: get IP from request
// ─────────────────────────────────────────────────────────────

async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    // Vercel + Cloudflare-style headers
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

// ─────────────────────────────────────────────────────────────
//  Audit logging
// ─────────────────────────────────────────────────────────────

interface AuditEvent {
  event: "signin_success" | "signin_failure" | "signin_rate_limited";
  email: string;
  ip: string | null;
  reason?: string;
  userId?: string;
}

function logAuditEvent(event: AuditEvent): void {
  // Structured log for parsing later
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
}

// ─────────────────────────────────────────────────────────────
//  Signin action
// ─────────────────────────────────────────────────────────────

export async function signinAction(
  _prev: SigninState,
  formData: FormData,
): Promise<SigninState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const remember = formData.get("remember") === "on";
  const ip = await getClientIp();

  // ─── Input validation ───
  if (!email) {
    return {
      status: "error",
      message: "Please enter your email",
      errors: { email: "Email is required" },
    };
  }

  if (!password) {
    return {
      status: "error",
      message: "Please enter your password",
      errors: { password: "Password is required" },
    };
  }

  // ─── Rate limit check ───
  const rateLimit = checkRateLimit(email, ip);
  if (!rateLimit.allowed) {
    logAuditEvent({
      event: "signin_rate_limited",
      email,
      ip,
      reason: rateLimit.reason,
    });

    return {
      status: "error",
      message: `Too many failed attempts. Try again in ${rateLimit.retryAfterMinutes} minute${
        rateLimit.retryAfterMinutes === 1 ? "" : "s"
      }.`,
    };
  }

  try {
    // ─── Pre-check: does user exist + status ───
    // We do this BEFORE NextAuth to distinguish "pending approval" from
    // "invalid credentials" while keeping constant-time response for security
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        accountStatus: true,
        password: true,
      },
    });

    // Constant-time approach: always attempt the sign in (NextAuth will compare
    // password whether user exists or not via dummy hash compare). But we
    // intercept the result for pending users.

    // ─── Attempt signin via NextAuth ───
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // NextAuth returns nothing for successful credentials login (it sets cookie)
    // If it throws, credentials were wrong

    // ─── Check user state after auth ───
    if (!user || !user.password) {
      // User doesn't exist — treat same as wrong password
      recordFailedAttempt(email, ip);
      logAuditEvent({
        event: "signin_failure",
        email,
        ip,
        reason: "user_not_found",
      });
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // ─── Check account status ───
    if (user.accountStatus === "PENDING") {
      // Don't count this as failed attempt (legit pending)
      logAuditEvent({
        event: "signin_success",
        email,
        ip,
        userId: user.id,
        reason: "pending_approval",
      });

      // Redirect to pending page (NextAuth already set session)
      return {
        status: "success",
        redirectTo: "/auth/verification-pending",
      };
    }

    if (user.accountStatus === "SUSPENDED") {
      logAuditEvent({
        event: "signin_failure",
        email,
        ip,
        userId: user.id,
        reason: "suspended",
      });

      return {
        status: "error",
        message:
          "Your account has been suspended. Please contact the society admin.",
      };
    }

    // ─── Success ───
    clearAttempts(email, ip);
    logAuditEvent({
      event: "signin_success",
      email,
      ip,
      userId: user.id,
    });

    return {
      status: "success",
      redirectTo: "/", // Root will redirect to admin or resident per role
    };
  } catch (error) {
    // NextAuth throws on invalid credentials
    recordFailedAttempt(email, ip);
    logAuditEvent({
      event: "signin_failure",
      email,
      ip,
      reason: "invalid_credentials",
    });

    return {
      status: "error",
      message: "Invalid email or password",
    };
  }
}
