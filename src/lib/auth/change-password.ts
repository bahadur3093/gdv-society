"use server";

import { hash, compare } from "bcryptjs";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/auth/common-passwords";

export interface ChangePasswordState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
}

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { status: "error", message: "Not signed in" };
  }

  const currentPassword = (formData.get("currentPassword") as string) ?? "";
  const newPassword = (formData.get("newPassword") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  const errors: NonNullable<ChangePasswordState["errors"]> = {};

  if (!currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!newPassword) {
    errors.newPassword = "New password is required";
  } else {
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      errors.newPassword = passwordErrors[0];
    } else if (newPassword === currentPassword) {
      errors.newPassword = "New password must be different from current";
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (newPassword && newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the errors below",
      errors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return { status: "error", message: "Account not found" };
    }

    // Verify current password
    const valid = await compare(currentPassword, user.password);
    if (!valid) {
      return {
        status: "error",
        message: "Current password is incorrect",
        errors: { currentPassword: "Incorrect password" },
      };
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update + invalidate any pending reset tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetRequest.updateMany({
        where: { userId: user.id, status: "APPROVED" },
        data: { status: "EXPIRED" },
      }),
    ]);

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "password_changed",
        userId: user.id,
        email: session.user.email,
      }),
    );

    return {
      status: "success",
      message: "Password updated successfully",
    };
  } catch (e) {
    console.error("[changePasswordAction] failed:", e);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
