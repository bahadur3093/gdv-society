"use server";

import { headers } from "next/headers";
import { signIn } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { validatePassword } from "@/lib/auth/common-passwords";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";

export interface SignupState {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    plotNumber?: string;
    terms?: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  Helpers (shared with signin pattern)
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
    | "signup_success"
    | "signup_failure"
    | "signup_rate_limited"
    | "signup_villa_conflict";
  email: string;
  ip: string | null;
  reason?: string;
  userId?: string;
  plotNumber?: string;
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
//  Email format validation
// ─────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

// ─────────────────────────────────────────────────────────────
//  Signup action
// ─────────────────────────────────────────────────────────────

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const plotNumber = (formData.get("plotNumber") as string)?.trim() ?? "";
  const terms = formData.get("terms") === "on";
  const ip = await getClientIp();

  const errors: NonNullable<SignupState["errors"]> = {};

  // ─── Field validation ───
  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (name.length > 100) {
    errors.name = "Name is too long";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else {
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0];
    }
  }

  if (!plotNumber) {
    errors.plotNumber = "Plot number is required";
  } else if (plotNumber.length > 50) {
    errors.plotNumber = "Plot number is too long";
  }

  if (!terms) {
    errors.terms = "You must accept the Terms and Privacy Policy";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the errors below",
      errors,
    };
  }

  // ─── Rate limit check (IP-only for signup) ───
  const rateLimit = checkRateLimit(email, ip);
  if (!rateLimit.allowed) {
    logAuditEvent({
      event: "signup_rate_limited",
      email,
      ip,
      reason: rateLimit.reason,
    });
    return {
      status: "error",
      message: `Too many attempts. Try again in ${rateLimit.retryAfterMinutes} minute${
        rateLimit.retryAfterMinutes === 1 ? "" : "s"
      }.`,
    };
  }

  try {
    // ─── Check email uniqueness ───
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, accountStatus: true },
    });

    if (existingUser) {
      recordFailedAttempt(email, ip);
      logAuditEvent({
        event: "signup_failure",
        email,
        ip,
        reason: "email_exists",
      });

      return {
        status: "error",
        message:
          "An account with this email already exists. Try signing in instead.",
        errors: { email: "This email is already registered" },
      };
    }

    // ─── Check villa availability ───
    // Plot numbers may map to Villa.villaNo (numeric)
    // We accept free-form plot strings but check if any Villa exists with this # that's already claimed
    const plotAsInt = parseInt(plotNumber, 10);
    if (!isNaN(plotAsInt)) {
      const villa = await prisma.villa.findUnique({
        where: { villaNo: plotAsInt },
        select: {
          id: true,
          villaNo: true,
          userId: true,
          user: { select: { name: true } },
        },
      });

      // If villa exists AND is already claimed by someone else
      if (villa && villa.userId) {
        logAuditEvent({
          event: "signup_villa_conflict",
          email,
          ip,
          plotNumber,
          reason: "villa_already_claimed",
        });

        return {
          status: "error",
          message: `Villa ${villa.villaNo} is already registered to another account. If you're a family member, please use their login. If this is a mistake, contact the society admin.`,
          errors: {
            plotNumber: "This villa is already registered",
          },
        };
      }
    }

    // ─── Hash password ───
    const hashedPassword = await hash(password, 12);

    // ─── Create user ───
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plotNumber,
        role: "RESIDENT",
        accountStatus: "PENDING",
      },
      select: { id: true, email: true },
    });

    logAuditEvent({
      event: "signup_success",
      email: newUser.email,
      ip,
      userId: newUser.id,
      plotNumber,
    });

    // ─── Auto sign-in (sets session) ───
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (signInError) {
      // Session setup failed but user IS created
      // They can sign in manually
      console.error("[signupAction] auto sign-in failed", signInError);
      return {
        status: "success",
        message: "Account created. Please sign in to continue.",
        redirectTo: "/auth/signin",
      };
    }

    // ─── Redirect to verification-pending page ───
    return {
      status: "success",
      redirectTo: "/auth/verification-pending",
    };
  } catch (error) {
    console.error("[signupAction] failed", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
