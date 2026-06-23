"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recordPayment } from "@/lib/billing/recordPayment";
import { requireAdmin } from "@/lib/auth/auth";

export interface ReviewActionState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Allocations summary for the success toast */
  allocations?: { description: string; amount: number }[];
  unallocatedAmount?: number;
}

// ─────────────────────────────────────────────────────────────
//  APPROVE — calls recordPayment(), creates the Payment row,
//  links it back to the PaymentRequest
// ─────────────────────────────────────────────────────────────

export async function approvePaymentRequestAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  try {
    const admin = await requireAdmin();
    const requestId = formData.get("requestId") as string;

    if (!requestId) {
      return { status: "error", message: "Missing request ID" };
    }

    // Fetch the request with villa info
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
        message: `This request was already ${request.status.toLowerCase()}. Refresh to see latest status.`,
      };
    }

    // Use recordPayment with the request's data
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
      recordedByAdminId: admin.id,
    });

    // Mark request as approved + link the payment
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        paymentId: result.paymentId,
      },
    });

    // Revalidate every affected page
    revalidatePath("/admin/payments");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin");
    revalidatePath("/resident");
    revalidatePath("/resident/pay");
    revalidatePath("/resident/ledger");
    if (request.villa.userId) {
      revalidatePath(`/admin/ledger/${request.villa.userId}`);
    }

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
    console.error("[approvePaymentRequestAction] failed", e);
    return {
      status: "error",
      message:
        e instanceof Error ? e.message : "Failed to approve payment request",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  REJECT — just updates status + reason
// ─────────────────────────────────────────────────────────────

export async function rejectPaymentRequestAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  try {
    const admin = await requireAdmin();
    const requestId = formData.get("requestId") as string;
    const reason = (formData.get("reason") as string)?.trim();

    if (!requestId) {
      return { status: "error", message: "Missing request ID" };
    }
    if (!reason) {
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
        reviewedBy: admin.id,
        reviewNotes: reason,
      },
    });

    // Revalidate affected pages
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/resident");
    revalidatePath("/resident/pay");

    return {
      status: "success",
      message: "Request rejected. The resident will see your reason.",
    };
  } catch (e) {
    console.error("[rejectPaymentRequestAction] failed", e);
    return {
      status: "error",
      message:
        e instanceof Error ? e.message : "Failed to reject payment request",
    };
  }
}
