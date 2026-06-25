"use server";

import { requireAdmin } from "@/lib/auth/auth";
import {
  approvePaymentRequestCore,
  rejectPaymentRequestCore,
} from "@/lib/admin/payment-actions-core";

export interface ReviewActionState {
  status: "idle" | "success" | "error";
  message?: string;
  allocations?: { description: string; amount: number }[];
  unallocatedAmount?: number;
}

export async function approvePaymentRequestAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const admin = await requireAdmin();
  const requestId = formData.get("requestId") as string;
  return approvePaymentRequestCore(requestId, admin.id);
}

// ─────────────────────────────────────────────────────────────
//  REJECT — just updates status + reason
// ─────────────────────────────────────────────────────────────

export async function rejectPaymentRequestAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const admin = await requireAdmin();
  const requestId = formData.get("requestId") as string;
  const reason = (formData.get("reason") as string)?.trim() ?? "";
  return rejectPaymentRequestCore(requestId, admin.id, reason);
}
