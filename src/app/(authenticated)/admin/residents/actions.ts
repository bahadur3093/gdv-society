"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface EditResidentState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    name?: string;
    email?: string;
    plotNumber?: string;
    villaId?: string;
  };
}

export interface ResetPasswordState {
  status: "idle" | "success" | "error";
  message?: string;
}

// ─────────────────────────────────────────────────────────────
//  Edit resident
// ─────────────────────────────────────────────────────────────

export async function editResidentAction(
  _prev: EditResidentState,
  formData: FormData,
): Promise<EditResidentState> {
  try {
    await requireAdmin();

    const userId = formData.get("userId") as string;
    if (!userId) {
      return { status: "error", message: "Missing user ID" };
    }

    // Validate input
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const plotNumber = (formData.get("plotNumber") as string)?.trim() || null;
    const villaIdRaw = formData.get("villaId") as string;
    // Empty string means "unlink", any value means "link to this villa"
    const villaId = villaIdRaw === "" ? null : villaIdRaw;

    const errors: NonNullable<EditResidentState["errors"]> = {};

    if (!name) errors.name = "Name is required";
    else if (name.length > 100)
      errors.name = "Name must be 100 characters or less";

    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (Object.keys(errors).length > 0) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors,
      };
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        villa: { select: { id: true } },
      },
    });

    if (!existingUser || existingUser.role !== "RESIDENT") {
      return { status: "error", message: "Resident not found" };
    }

    // Check for email collision (different user with same email)
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (emailTaken && emailTaken.id !== userId) {
        return {
          status: "error",
          message: "Email already in use",
          errors: { email: "This email is already taken by another account" },
        };
      }
    }

    // Validate villa link
    if (villaId) {
      const targetVilla = await prisma.villa.findUnique({
        where: { id: villaId },
        select: { id: true, userId: true },
      });
      if (!targetVilla) {
        return {
          status: "error",
          message: "Selected villa not found",
          errors: { villaId: "Invalid villa selection" },
        };
      }
      // If villa is already claimed by someone else, error
      if (targetVilla.userId && targetVilla.userId !== userId) {
        return {
          status: "error",
          message: "Villa already claimed",
          errors: { villaId: "This villa is linked to another resident" },
        };
      }
    }

    // ─── Perform updates in a transaction ───
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          plotNumber,
        },
      });

      // If villa link is changing, update villa.userId
      const currentVillaId = existingUser.villa?.id ?? null;
      if (currentVillaId !== villaId) {
        // Unlink old villa
        if (currentVillaId) {
          await tx.villa.update({
            where: { id: currentVillaId },
            data: { userId: null },
          });
        }
        // Link new villa
        if (villaId) {
          await tx.villa.update({
            where: { id: villaId },
            data: { userId },
          });
        }
      }
    });

    // Revalidate every page that shows this resident's info
    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${userId}`);
    revalidatePath("/admin/ledger");
    revalidatePath(`/admin/ledger/${userId}`);
    revalidatePath("/resident");

    return {
      status: "success",
      message: "Resident details updated",
    };
  } catch (e) {
    console.error("[editResidentAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update resident",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Reset password — creates a PasswordResetRequest (admin-initiated)
// ─────────────────────────────────────────────────────────────

export async function resetResidentPasswordAction(
  userId: string,
): Promise<ResetPasswordState> {
  try {
    const admin = await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user || user.role !== "RESIDENT") {
      return { status: "error", message: "Resident not found" };
    }

    // Generate a reset token (valid 24 hours)
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Cancel any existing pending reset requests for this user
    await prisma.passwordResetRequest.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "EXPIRED" },
    });

    // Create new approved reset request (admin auto-approves)
    await prisma.passwordResetRequest.create({
      data: {
        userId,
        status: "APPROVED",
        token,
        requestedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: admin.id,
        expiresAt,
      },
    });

    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${userId}`);

    // TODO: Send email with reset link (Step 30f / future)
    // For now, the admin gets confirmation. The reset link will be
    // /auth/reset-password?token=<token>

    return {
      status: "success",
      message: `Password reset link generated for ${user.email}. They can use it within 24 hours.`,
    };
  } catch (e) {
    console.error("[resetResidentPasswordAction] failed", e);
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
  // Generates a cryptographically random URL-safe token
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const bytes = new Uint8Array(length);

  // Use crypto.getRandomValues if available
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback (less secure)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}
