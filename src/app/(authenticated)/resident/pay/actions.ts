"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireResident } from "@/lib/auth/auth";
import { createBulkNotifications, getAllAdminIds } from "@/lib/notifications/create";

export interface SubmitPaymentRequestState {
  status: "idle" | "success" | "error";
  message?: string;
  requestId?: string;
}

export async function submitPaymentRequestAction(
  _prev: SubmitPaymentRequestState,
  formData: FormData,
): Promise<SubmitPaymentRequestState> {
  try {
    const user = await requireResident();

    // Find the resident's villa
    const villa = await prisma.villa.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!villa) {
      return {
        status: "error",
        message:
          "No villa is linked to your account. Contact the society admin.",
      };
    }

    // Parse + validate
    const amount = parseFloat(formData.get("amount") as string);
    const method = formData.get("method") as PaymentMethod;
    const reference = (formData.get("reference") as string)?.trim() || null;
    const notes = (formData.get("notes") as string)?.trim() || null;
    const submittedAtRaw = formData.get("submittedAt") as string;

    if (isNaN(amount) || amount <= 0) {
      return { status: "error", message: "Amount must be greater than zero" };
    }
    if (!Object.values(PaymentMethod).includes(method)) {
      return { status: "error", message: "Invalid payment method" };
    }

    const submittedAt = submittedAtRaw ? new Date(submittedAtRaw) : new Date();
    if (isNaN(submittedAt.getTime())) {
      return { status: "error", message: "Invalid date" };
    }

    // Check for duplicate pending request (same villa + same amount + same method
    // within last 5 minutes — prevents accidental double-submit)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = await prisma.paymentRequest.findFirst({
      where: {
        userId: user.id,
        villaId: villa.id,
        amount,
        method,
        status: "PENDING",
        submittedAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentDuplicate) {
      return {
        status: "error",
        message:
          "A similar request was just submitted. Check your pending requests.",
      };
    }

    // Create the request
    const request = await prisma.paymentRequest.create({
      data: {
        villaId: villa.id,
        userId: user.id,
        amount,
        method,
        reference,
        notes,
        submittedAt,
        status: "PENDING",
      },
    });

    // Revalidate the affected pages
    revalidatePath("/resident");
    revalidatePath("/resident/pay");
    revalidatePath("/resident/ledger");
    revalidatePath("/admin/payments"); // for the admin queue (Step 30c)

    const adminIds = await getAllAdminIds();
    await createBulkNotifications(adminIds, {
      category: "PAYMENT",
      title: "💰 New payment request",
      body: `${user.name} submitted ₹${amount.toLocaleString("en-IN")} via ${method}`,
      link: "/admin/payments",
    });

    return {
      status: "success",
      message: "Payment request submitted",
      requestId: request.id,
    };
  } catch (e) {
    console.error("[submitPaymentRequestAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to submit request",
    };
  }
}
