"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  FileText,
  MoreHorizontal,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  XCircle,
} from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import {
  submitPaymentRequestAction,
  type SubmitPaymentRequestState,
} from "../actions";
import type { PendingRequest } from "@/lib/billing/getResidentPendingRequests";
import { toast } from "@/components/atoms/Toast";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";

const initialState: SubmitPaymentRequestState = { status: "idle" };

const today = () => new Date().toISOString().split("T")[0];

const METHODS: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  hint?: string;
}> = [
  {
    value: PaymentMethod.UPI,
    label: "UPI",
    icon: <Smartphone className="w-4 h-4" />,
    hint: "GPay, PhonePe, Paytm",
  },
  {
    value: PaymentMethod.BANK_TRANSFER,
    label: "Bank Transfer",
    icon: <Building2 className="w-4 h-4" />,
    hint: "NEFT/IMPS/RTGS",
  },
  {
    value: PaymentMethod.CASH,
    label: "Cash",
    icon: <Banknote className="w-4 h-4" />,
    hint: "Handed to admin",
  },
  {
    value: PaymentMethod.CHEQUE,
    label: "Cheque",
    icon: <FileText className="w-4 h-4" />,
    hint: "Bank cheque",
  },
  {
    value: PaymentMethod.OTHER,
    label: "Other",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
];

interface Props {
  outstandingBalance: number;
  villaNo: number;
  pendingRequests: PendingRequest[];
  pendingCount: number;
  pendingAmount: number;
}

export default function PayRequestForm({
  outstandingBalance,
  villaNo,
  pendingRequests,
  pendingCount,
  pendingAmount,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    submitPaymentRequestAction,
    initialState,
  );

  // Form state — default amount = outstanding minus already pending
  const effectiveOwed = Math.max(0, outstandingBalance - pendingAmount);
  const [amount, setAmount] = useState(
    effectiveOwed > 0 ? String(effectiveOwed) : "",
  );
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submittedAt, setSubmittedAt] = useState(today());

  const [isPending, startTransition] = useTransition();

  // Toast on success/error
  useEffect(() => {
    if (state.status === "success") {
      toast.success("Payment request submitted", {
        description: "Admin will verify and confirm within 24 hours.",
      });
    } else if (state.status === "error") {
      toast.error("Submission failed", { description: state.message });
    }
  }, [state]);

  // ─── Success state — replaces form ───
  if (state.status === "success") {
    return (
      <Card padding="lg" className="text-center">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h2 className="text-h2 text-text-primary">Request submitted</h2>
        <p className="text-body text-text-secondary mt-2 max-w-md mx-auto">
          The society admin will verify your payment and confirm it within 24
          hours. You&apos;ll see the update in your ledger.
        </p>

        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 justify-center mt-6">
          <Button
            asChild
            variant="ghost"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            <Link href={"/resident/ledger"}>View Ledger</Link>
          </Button>
          <Button asChild variant="primary" size="lg">
            <Link href={"/resident"}>Back to Dashboard</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Pending banner ─── */}
      {pendingCount > 0 && (
        <PendingBanner count={pendingCount} amount={pendingAmount} />
      )}

      {/* ─── Rejected banner (if any recent rejections) ─── */}
      {pendingRequests
        .filter((r) => r.status === "REJECTED")
        .map((req) => (
          <RejectedBanner key={req.id} request={req} />
        ))}

      {/* ─── Outstanding summary ─── */}
      <Card padding="md" className="bg-bg-sunken border-border-default">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-micro uppercase tracking-wider text-text-muted">
              Villa {villaNo} — Outstanding
            </p>
            <p
              className={cn(
                "text-h2 font-mono font-bold mt-1",
                outstandingBalance > 0 ? "text-text-primary" : "text-success",
              )}
            >
              {formatCurrency(outstandingBalance)}
            </p>
            {pendingAmount > 0 && (
              <p className="text-body-sm text-warning mt-1">
                {formatCurrency(pendingAmount)} pending admin verification
              </p>
            )}
          </div>
          {effectiveOwed === 0 && outstandingBalance > 0 && (
            <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
              All under review
            </Badge>
          )}
        </div>
      </Card>

      {/* ─── Form ─── */}
      <form action={formAction} className="space-y-6">
        <Card padding="md">
          <div className="space-y-5">
            {/* Amount */}
            <FormField
              label="Amount paid"
              required
              helperText={
                outstandingBalance > 0
                  ? `Outstanding: ${formatCurrency(outstandingBalance)}`
                  : "No outstanding amount"
              }
            >
              <Input
                type="number"
                name="amount"
                inputSize="lg"
                prefix="₹"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0"
              />
            </FormField>

            {/* Method chips */}
            <FormField
              label="Payment method"
              required
              helperText="How did you pay?"
            >
              <input type="hidden" name="method" value={method} />
              <div className="flex flex-wrap gap-2">
                {METHODS.map((m) => {
                  const isActive = method === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        "inline-flex items-center gap-2",
                        "px-4 h-11 rounded-full border",
                        "text-body-sm font-medium",
                        "transition-all duration-[var(--duration-fast)]",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-brand-primary/30",
                        isActive
                          ? "bg-brand-primary text-brand-primary-fg border-brand-primary shadow-sm"
                          : "bg-transparent text-text-secondary border-border-default hover:bg-bg-sunken hover:text-text-primary",
                      )}
                      aria-pressed={isActive}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              {METHODS.find((m) => m.value === method)?.hint && (
                <p className="text-body-sm text-text-muted mt-2">
                  {METHODS.find((m) => m.value === method)?.hint}
                </p>
              )}
            </FormField>

            {/* Reference */}
            <FormField
              label="Reference number"
              helperText={
                method === PaymentMethod.UPI
                  ? "UPI transaction ID from your app"
                  : method === PaymentMethod.BANK_TRANSFER
                    ? "Bank UTR / transaction reference"
                    : method === PaymentMethod.CHEQUE
                      ? "Cheque number"
                      : "Optional reference"
              }
            >
              <Input
                type="text"
                name="reference"
                placeholder={
                  method === PaymentMethod.UPI
                    ? "e.g., UPI/123456789012"
                    : "e.g., 1234567890"
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </FormField>

            {/* Date */}
            <FormField
              label="Payment date"
              required
              helperText="When you actually paid"
            >
              <Input
                type="date"
                name="submittedAt"
                value={submittedAt}
                onChange={(e) => setSubmittedAt(e.target.value)}
                required
                max={today()}
              />
            </FormField>

            {/* Notes */}
            <FormField
              label="Notes for admin"
              helperText="Any extra context (optional)"
            >
              <Input
                type="text"
                name="notes"
                placeholder="e.g., Paid for May + June bills"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>

            {/* Receipt upload placeholder for Step 30e */}
            <div
              className={cn(
                "p-4 rounded-md border border-dashed border-border-default",
                "bg-bg-sunken/50 text-center",
              )}
            >
              <p className="text-body-sm text-text-muted">
                📎 Receipt upload coming soon — for now, include reference
                number above.
              </p>
            </div>
          </div>
        </Card>

        {/* Error banner */}
        {state.status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border"
          >
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-danger">
                Submission failed
              </p>
              <p className="text-body-sm text-danger/90 mt-0.5">
                {state.message}
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end">
          <Button asChild type="button" variant="ghost" size="lg">
            <Link href={"/resident"}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<Send className="w-4 h-4" />}
            disabled={
              isPending ||
              !amount ||
              parseFloat(amount) <= 0 ||
              isNaN(parseFloat(amount))
            }
          >
            Submit for verification
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Pending banner — show if resident has unverified requests
// ─────────────────────────────────────────────────────────────

function PendingBanner({ count, amount }: { count: number; amount: number }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 p-4 rounded-md",
        "bg-warning-muted border border-warning-border",
      )}
    >
      <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-warning">
          {count} payment{count === 1 ? "" : "s"} under review
        </p>
        <p className="text-body-sm text-warning/90 mt-0.5">
          {formatCurrency(amount)} submitted, awaiting admin verification. Allow
          up to 24 hours.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Rejected banner — show recent rejections so resident sees why
// ─────────────────────────────────────────────────────────────

function RejectedBanner({ request }: { request: PendingRequest }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 p-4 rounded-md",
        "bg-danger-muted border border-danger-border",
      )}
    >
      <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-danger">
          Previous request for {formatCurrency(request.amount)} was rejected
        </p>
        {request.reviewNotes && (
          <p className="text-body-sm text-danger/90 mt-1">
            <strong>Reason:</strong> {request.reviewNotes}
          </p>
        )}
        <p className="text-body-sm text-danger/70 mt-1">
          {formatRelativeTime(request.submittedAt)}
        </p>
      </div>
    </div>
  );
}
