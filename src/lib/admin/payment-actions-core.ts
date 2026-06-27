import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recordPayment } from "@/lib/billing/recordPayment";
import { createNotification } from "../notifications/create";

export interface PaymentActionResult {
  status: "success" | "error";
  message?: string;
  allocations?: { description: string; amount: number }[];
  unallocatedAmount?: number;
}

/**
 * Core payment approval logic — does NOT check auth.
 * Caller must verify actor is admin.
 */
export async function approvePaymentRequestCore(
  requestId: string,
  adminId: string,
): Promise<PaymentActionResult> {
  try {
    if (!requestId) {
      return { status: "error", message: "Missing request ID" };
    }

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: {
        villa: { select: { id: true, userId: true } },
      },
    });

    if (!request) {
      return { status: "error", message: "Payment request not found" };
    }

    if (request.status !== "PENDING") {
      return {
        status: "error",
        message: `This request was already ${request.status.toLowerCase()}.`,
      };
    }

    const result = await recordPayment({
      villaId: request.villa.id,
      residentUserId: request.villa.userId ?? request.userId,
      amount: request.amount,
      method: request.method,
      reference: request.reference ?? undefined,
      notes: request.notes
        ? `[From resident request] ${request.notes}`
        : "[From resident payment request]",
      paidAt: request.submittedAt,
      recordedByAdminId: adminId,
    });

    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: adminId,
        paymentId: result.paymentId,
      },
    });

    await createNotification({
      userId: request.userId,
      category: "PAYMENT",
      title: "Payment approved ✓",
      body: `Your ₹${request.amount.toLocaleString("en-IN")} payment has been recorded.`,
      link: "/resident/ledger",
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin");
    revalidatePath("/resident");
    revalidatePath("/resident/pay");
    revalidatePath("/resident/ledger");
    if (request.villa.userId) {
      revalidatePath(`/admin/ledger/${request.villa.userId}`);
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "payment_request_approved",
        requestId,
        adminId,
        paymentId: result.paymentId,
        amount: request.amount,
      }),
    );

    return {
      status: "success",
      message: `Payment approved. ${result.allocations.length} item(s) allocated.${
        result.unallocatedAmount > 0
          ? ` ₹${result.unallocatedAmount.toLocaleString("en-IN")} as credit.`
          : ""
      }`,
      allocations: result.allocations.map((a) => ({
        description: a.description,
        amount: a.amountAllocated,
      })),
      unallocatedAmount: result.unallocatedAmount,
    };
  } catch (e) {
    console.error("[approvePaymentRequestCore] failed", e);
    return {
      status: "error",
      message:
        e instanceof Error ? e.message : "Failed to approve payment request",
    };
  }
}

/**
 * Core payment rejection logic — does NOT check auth.
 */
export async function rejectPaymentRequestCore(
  requestId: string,
  adminId: string,
  reason: string,
): Promise<PaymentActionResult> {
  try {
    if (!requestId) {
      return { status: "error", message: "Missing request ID" };
    }
    if (!reason || !reason.trim()) {
      return {
        status: "error",
        message: "Please provide a reason for rejection",
      };
    }
    if (reason.length > 500) {
      return {
        status: "error",
        message: "Reason is too long (max 500 characters)",
      };
    }

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      select: { status: true, userId: true },
    });

    if (!request) {
      return { status: "error", message: "Payment request not found" };
    }

    if (request.status !== "PENDING") {
      return {
        status: "error",
        message: `This request was already ${request.status.toLowerCase()}.`,
      };
    }

    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: adminId,
        reviewNotes: reason.trim(),
      },
    });

    await createNotification({
      userId: request.userId,
      category: "PAYMENT",
      title: "Payment request rejected",
      body: reason.trim().slice(0, 200),
      link: "/resident/pay",
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/resident");
    revalidatePath("/resident/pay");

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "payment_request_rejected",
        requestId,
        adminId,
      }),
    );

    return {
      status: "success",
      message: "Request rejected. The resident will see your reason.",
    };
  } catch (e) {
    console.error("[rejectPaymentRequestCore] failed", e);
    return {
      status: "error",
      message:
        e instanceof Error ? e.message : "Failed to reject payment request",
    };
  }
}
