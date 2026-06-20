"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import {
  recordPayment,
  type RecordPaymentResult,
} from "@/lib/billing/recordPayment";
import {
  getPaymentPreview,
  type PaymentPreview,
} from "@/lib/billing/getPaymentPreview";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/auth";

// ─── Preview action (uses villa context) ────────────────────

export async function previewPaymentAction(
  villaId: string,
  amount: number,
): Promise<PaymentPreview> {
  await requireAdmin();
  if (!villaId || !amount || amount <= 0) {
    return { totalOutstanding: 0, allocations: [], unallocatedAmount: 0 };
  }

  // Look up the villa's user (if claimed) for levy lookups
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { userId: true },
  });

  return getPaymentPreview(villaId, villa?.userId ?? null, amount);
}

// ─── Record action ────────────────────────────────────────────

export interface RecordPaymentState {
  status: "idle" | "success" | "error";
  message?: string;
  result?: RecordPaymentResult;
}

export async function recordPaymentAction(
  _prev: RecordPaymentState,
  formData: FormData,
): Promise<RecordPaymentState> {
  try {
    const admin = await requireAdmin();

    const villaId = formData.get("villaId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const method = formData.get("method") as PaymentMethod;
    const reference = (formData.get("reference") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;
    const paidAtRaw = formData.get("paidAt") as string;

    // Validation
    if (!villaId) return { status: "error", message: "Villa is required" };
    if (isNaN(amount) || amount <= 0)
      return { status: "error", message: "Amount must be greater than zero" };
    if (!Object.values(PaymentMethod).includes(method)) {
      return { status: "error", message: "Invalid payment method" };
    }

    const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();
    if (isNaN(paidAt.getTime()))
      return { status: "error", message: "Invalid date" };

    // Look up the villa's claimed user (if any)
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { userId: true },
    });
    if (!villa) return { status: "error", message: "Villa not found" };

    const result = await recordPayment({
      villaId,
      residentUserId: villa.userId ?? undefined,
      amount,
      method,
      reference,
      notes,
      paidAt,
      recordedByAdminId: admin.id,
    });

    revalidatePath("/admin/ledger");
    revalidatePath("/admin/payments/new");
    revalidatePath("/resident/ledger");
    if (villa.userId) {
      revalidatePath(`/admin/ledger/${villa.userId}`);
    }

    return {
      status: "success",
      message: `Payment recorded. ${result.allocations.length} item(s) allocated.${
        result.unallocatedAmount > 0
          ? ` ₹${result.unallocatedAmount} added as credit.`
          : ""
      }`,
      result,
    };
  } catch (e) {
    console.error("[recordPaymentAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to record payment",
    };
  }
}
