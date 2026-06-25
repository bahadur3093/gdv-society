import "server-only";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  status: "success" | "error";
  message?: string;
}

/**
 * Core approval logic — does NOT check auth.
 * Caller is responsible for verifying the actor is admin.
 */
export async function approveResidentCore(
  userId: string,
): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
      },
    });

    if (!user) {
      return { status: "error", message: "User not found" };
    }

    if (user.role !== "RESIDENT") {
      return {
        status: "error",
        message: "Only resident accounts can be approved",
      };
    }

    if (user.accountStatus === "APPROVED") {
      return {
        status: "error",
        message: "Account is already approved",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "APPROVED",
        emailVerified:
          user.accountStatus === "PENDING" ? new Date() : undefined,
      },
    });

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "resident_approved",
        userId,
        email: user.email,
        previousStatus: user.accountStatus,
      }),
    );

    return {
      status: "success",
      message: `${user.name} has been approved`,
    };
  } catch (e) {
    console.error("[approveResidentCore] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to approve",
    };
  }
}

/**
 * Core suspend logic — does NOT check auth.
 */
export async function suspendResidentCore(
  userId: string,
  reason?: string,
): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, accountStatus: true },
    });

    if (!user) {
      return { status: "error", message: "User not found" };
    }

    if (user.accountStatus === "SUSPENDED") {
      return { status: "error", message: "Account is already suspended" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: "SUSPENDED" },
    });

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "resident_suspended",
        userId,
        email: user.email,
        previousStatus: user.accountStatus,
        reason: reason ?? "not provided",
      }),
    );

    return {
      status: "success",
      message: `${user.name} has been suspended`,
    };
  } catch (e) {
    console.error("[suspendResidentCore] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to suspend",
    };
  }
}
