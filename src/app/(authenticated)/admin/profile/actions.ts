"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface EditAdminProfileState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    name?: string;
  };
}

export interface AdminPasswordResetState {
  status: "idle" | "success" | "error";
  message?: string;
}

// ─────────────────────────────────────────────────────────────
//  Edit admin profile (name only)
// ─────────────────────────────────────────────────────────────

export async function editAdminProfileAction(
  _prev: EditAdminProfileState,
  formData: FormData,
): Promise<EditAdminProfileState> {
  try {
    const admin = await requireAdmin();

    const name = (formData.get("name") as string)?.trim() ?? "";

    const errors: NonNullable<EditAdminProfileState["errors"]> = {};

    if (!name) errors.name = "Name is required";
    else if (name.length > 100)
      errors.name = "Name must be 100 characters or less";
    else if (name.length < 2)
      errors.name = "Name must be at least 2 characters";

    if (Object.keys(errors).length > 0) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors,
      };
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { name },
    });

    revalidatePath("/admin/profile");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Profile updated",
    };
  } catch (e) {
    console.error("[editAdminProfileAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update profile",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Request password reset (admin self-service)
//  Generates token immediately (admins don't need approval)
// ─────────────────────────────────────────────────────────────

export async function requestAdminPasswordResetAction(): Promise<AdminPasswordResetState> {
  try {
    const admin = await requireAdmin();

    // Cancel existing pending resets
    await prisma.passwordResetRequest.updateMany({
      where: { userId: admin.id, status: "PENDING" },
      data: { status: "EXPIRED" },
    });

    // Generate token
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordResetRequest.create({
      data: {
        userId: admin.id,
        status: "APPROVED",
        token,
        requestedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: admin.id, // self-approved
        expiresAt,
      },
    });

    revalidatePath("/admin/profile");

    // TODO Step 30f: send email with reset link
    // For now, log it so admin can find it
    console.log(`[Admin password reset] User ${admin.email}: token=${token}`);

    return {
      status: "success",
      message: `Password reset link generated. You can use it within 24 hours.`,
    };
  } catch (e) {
    console.error("[requestAdminPasswordResetAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to generate reset link",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function generateToken(length: number): string {
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
