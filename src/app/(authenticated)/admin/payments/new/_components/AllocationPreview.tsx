"use client";

import {
  ArrowRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { PaymentPreview } from "@/lib/billing/getPaymentPreview";
import Card from "@/components/atoms/Card";
import { cn, formatCurrency } from "@/lib/utils/utils";

interface Props {
  preview: PaymentPreview | null;
  loading: boolean;
  isReady: boolean; // True when villa + amount are set
}

export default function AllocationPreview({
  preview,
  loading,
  isReady,
}: Props) {
  // ─── Not yet ready ───
  if (!isReady) {
    return (
      <Card padding="md" className="md:sticky md:top-20">
        <div className="text-center py-6">
          <Wallet className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-body font-medium text-text-primary">
            Allocation preview
          </p>
          <p className="text-body-sm text-text-secondary mt-1">
            Select a villa and enter an amount to see how the payment will be
            distributed.
          </p>
        </div>
      </Card>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <Card padding="md" className="md:sticky md:top-20">
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 text-text-muted animate-spin mx-auto mb-3" />
          <p className="text-body-sm text-text-muted">Computing allocation…</p>
        </div>
      </Card>
    );
  }

  if (!preview) return null;

  // ─── Nothing to allocate ───
  if (preview.allocations.length === 0 && preview.unallocatedAmount === 0) {
    return (
      <Card padding="md" className="md:sticky md:top-20">
        <div className="text-center py-6">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
          <p className="text-body font-medium text-text-primary">
            Nothing to allocate
          </p>
          <p className="text-body-sm text-text-secondary mt-1">
            This villa has no outstanding bills or levies.
          </p>
        </div>
      </Card>
    );
  }

  const totalAllocated = preview.allocations.reduce(
    (s, a) => s + a.amountAllocated,
    0,
  );
  const hasOverpayment = preview.unallocatedAmount > 0;

  return (
    <Card padding="md" className="md:sticky md:top-20 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-brand-primary" />
          <p className="text-body font-semibold text-text-primary">
            Payment will be allocated as
          </p>
        </div>
        <p className="text-body-sm text-text-muted">
          Auto-applied to oldest unpaid items first
        </p>
      </div>

      {/* Allocation list */}
      <ul className="space-y-2.5">
        {preview.allocations.map((a, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2.5 text-body-sm",
              "pb-2.5 last:pb-0",
              "last:border-b-0 border-b border-border-subtle",
            )}
          >
            <ArrowRight className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary leading-snug">{a.description}</p>
              {a.fullyCovered && (
                <p className="text-micro uppercase text-success font-medium tracking-wider mt-0.5">
                  Completes this {a.type === "BILL" ? "bill" : "levy"}
                </p>
              )}
            </div>
            <span className="font-mono font-medium text-text-primary whitespace-nowrap">
              {formatCurrency(a.amountAllocated)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="pt-3 border-t border-border-default">
        <div className="flex items-center justify-between">
          <span className="text-body font-medium text-text-primary">
            Total allocated
          </span>
          <span className="font-mono font-semibold text-text-primary">
            {formatCurrency(totalAllocated)}
          </span>
        </div>

        {/* Overpayment notice */}
        {hasOverpayment && (
          <div className="mt-3 flex gap-2.5 p-3 rounded-md bg-info-muted border border-info-border">
            <AlertCircle className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-info">
                Overpayment: {formatCurrency(preview.unallocatedAmount)}
              </p>
              <p className="text-body-sm text-info/90 mt-0.5">
                Will be credited to the villa for future bills.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
