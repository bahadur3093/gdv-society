"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Hash,
  MessageSquare,
  Receipt,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  approvePaymentRequestAction,
  rejectPaymentRequestAction,
  type ReviewActionState,
} from "../actions";
import type { AdminPaymentRequestRow } from "@/lib/billing/getAdminPaymentRequests";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils/utils";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";

const initialState: ReviewActionState = { status: "idle" };

interface Props {
  request: AdminPaymentRequestRow;
  onClose: () => void;
}

export default function ReviewRequestSheet({ request, onClose }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<"review" | "reject-form">("review");
  const [rejectReason, setRejectReason] = useState("");

  // Action states
  const [approveState, approveAction] = useActionState(
    approvePaymentRequestAction,
    initialState,
  );
  const [rejectState, rejectAction] = useActionState(
    rejectPaymentRequestAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  const isStillPending = request.status === "PENDING";

  // Toast + close on success
  useEffect(() => {
    if (approveState.status === "success") {
      toast.success("Payment approved", {
        description: approveState.message,
      });
      router.refresh();
      onClose();
    } else if (approveState.status === "error") {
      toast.error("Failed to approve", { description: approveState.message });
    }
  }, [approveState.status]); // intentionally not watching message/onClose

  useEffect(() => {
    if (rejectState.status === "success") {
      toast.success("Request rejected", {
        description: rejectState.message,
      });
      router.refresh();
      onClose();
    } else if (rejectState.status === "error") {
      toast.error("Failed to reject", { description: rejectState.message });
    }
  }, [rejectState.status]); // intentionally not watching message/onClose

  // ─── Handlers ───
  const handleApprove = () => {
    const formData = new FormData();
    formData.set("requestId", request.id);
    startTransition(() => approveAction(formData));
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    const formData = new FormData();
    formData.set("requestId", request.id);
    formData.set("reason", rejectReason.trim());
    startTransition(() => rejectAction(formData));
  };

  return (
    <ResponsiveSheet
      open={!!request}
      onOpenChange={(open) => !open && !isPending && onClose()}
      title={
        stage === "reject-form"
          ? "Reject this request?"
          : "Review payment request"
      }
      description={
        stage === "reject-form"
          ? "Tell the resident why so they can resubmit correctly."
          : `Villa ${request.villaNo}`
      }
      size="lg"
      footer={
        stage === "review" ? (
          isStillPending ? (
            <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 w-full md:justify-end">
              <Button
                variant="danger"
                size="lg"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => setStage("reject-form")}
                disabled={isPending}
                fullWidth
                className="md:max-w-50"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={
                  isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
                onClick={handleApprove}
                disabled={isPending}
                fullWidth
                className="md:max-w-70"
              >
                {isPending ? "Recording…" : "Approve & Record Payment"}
              </Button>
            </div>
          ) : (
            <div className="w-full text-center">
              <Button variant="ghost" size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          )
        ) : (
          // reject-form stage
          <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 w-full md:justify-end">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setStage("review")}
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="lg"
              icon={
                isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )
              }
              onClick={handleReject}
              disabled={!rejectReason.trim() || isPending}
            >
              {isPending ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </div>
        )
      }
    >
      {stage === "review" ? (
        <ReviewContent request={request} />
      ) : (
        <RejectForm reason={rejectReason} onChange={setRejectReason} />
      )}
    </ResponsiveSheet>
  );
}

// ─────────────────────────────────────────────────────────────
//  Review content (unchanged from Step 30c)
// ─────────────────────────────────────────────────────────────

function ReviewContent({ request }: { request: AdminPaymentRequestRow }) {
  return (
    <div className="space-y-6">
      {/* Resident header */}
      <div className="flex items-start gap-3 pb-4 border-b border-border-subtle">
        <Avatar
          size="lg"
          name={request.residentName ?? request.villaOwnerName}
        />
        <div className="flex-1 min-w-0">
          <p className="text-h4 text-text-primary truncate">
            {request.residentName ?? request.villaOwnerName}
          </p>
          {request.residentEmail && (
            <p className="text-body-sm text-text-secondary truncate">
              {request.residentEmail}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="info" size="sm">
              Villa {request.villaNo}
            </Badge>
            <Badge
              variant={
                request.status === "PENDING"
                  ? "warning"
                  : request.status === "APPROVED"
                    ? "success"
                    : "danger"
              }
              size="sm"
            >
              {request.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Amount comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-md bg-brand-primary/5 border border-brand-primary/20">
          <p className="text-micro uppercase text-text-muted tracking-wider">
            Submitted
          </p>
          <p className="text-h3 font-mono font-bold text-brand-primary mt-1">
            {formatCurrency(request.amount)}
          </p>
        </div>
        <div className="p-4 rounded-md bg-bg-sunken border border-border-subtle">
          <p className="text-micro uppercase text-text-muted tracking-wider">
            Currently owed
          </p>
          <p
            className={cn(
              "text-h3 font-mono font-bold mt-1",
              request.villaOutstanding > 0 ? "text-warning" : "text-success",
            )}
          >
            {formatCurrency(request.villaOutstanding)}
          </p>
        </div>
      </div>

      {/* Overpayment warning */}
      {request.amount > request.villaOutstanding &&
        request.villaOutstanding > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-info-muted border border-info-border">
            <AlertCircle className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <p className="text-body-sm text-info">
              Submitted amount is{" "}
              <strong>
                {formatCurrency(request.amount - request.villaOutstanding)}
              </strong>{" "}
              more than currently owed. Excess will be applied as credit.
            </p>
          </div>
        )}

      {/* Details list */}
      <dl className="space-y-1">
        <DetailRow
          label="Payment method"
          value={formatMethod(request.method)}
        />
        <DetailRow
          label="Reference"
          value={
            request.reference ? (
              <span className="font-mono">{request.reference}</span>
            ) : (
              <span className="text-text-muted">Not provided</span>
            )
          }
          icon={<Hash />}
        />
        <DetailRow
          label="Date of payment"
          value={formatDateTime(request.submittedAt)}
          icon={<Calendar />}
        />
        {request.notes && (
          <DetailRow
            label="Resident's notes"
            value={request.notes}
            icon={<MessageSquare />}
          />
        )}
      </dl>

      {/* Receipt */}
      {request.receiptUrl ? (
        <div>
          <p className="text-body-sm font-medium text-text-primary mb-2">
            Receipt
          </p>
          <a
            href={request.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-border-subtle overflow-hidden hover:border-border-default transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a
              href={request.receiptUrl}
              className="w-full max-h-96 object-contain bg-bg-sunken"
            />
          </a>
          <a
            href={request.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-body-sm text-brand-primary hover:underline"
          >
            Open full size <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="p-4 rounded-md bg-bg-sunken border border-dashed border-border-default text-center">
          <Receipt className="w-6 h-6 text-text-muted mx-auto mb-1" />
          <p className="text-body-sm text-text-muted">
            No receipt attached. Verify via reference number above.
          </p>
        </div>
      )}

      {/* Already-reviewed info */}
      {request.status !== "PENDING" && request.reviewedAt && (
        <div
          className={cn(
            "p-4 rounded-md",
            request.status === "APPROVED"
              ? "bg-success-muted border border-success-border"
              : "bg-danger-muted border border-danger-border",
          )}
        >
          <div className="flex items-start gap-2.5">
            {request.status === "APPROVED" ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={cn(
                  "text-body font-medium",
                  request.status === "APPROVED"
                    ? "text-success"
                    : "text-danger",
                )}
              >
                {request.status === "APPROVED" ? "Approved" : "Rejected"}{" "}
                {request.reviewerName && `by ${request.reviewerName}`}
              </p>
              <p
                className={cn(
                  "text-body-sm mt-0.5",
                  request.status === "APPROVED"
                    ? "text-success/90"
                    : "text-danger/90",
                )}
              >
                {formatDateTime(request.reviewedAt)}
              </p>
              {request.reviewNotes && (
                <p
                  className={cn(
                    "text-body-sm mt-2",
                    request.status === "APPROVED"
                      ? "text-success/90"
                      : "text-danger/90",
                  )}
                >
                  <strong>Reason:</strong> {request.reviewNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Reject form (unchanged from Step 30c)
// ─────────────────────────────────────────────────────────────

function RejectForm({
  reason,
  onChange,
}: {
  reason: string;
  onChange: (reason: string) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField
        label="Reason for rejection"
        required
        helperText="Will be shown to the resident so they can correct and resubmit."
      >
        <Input
          type="text"
          value={reason}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Reference number doesn't match"
          inputSize="lg"
          autoFocus
        />
      </FormField>

      <div>
        <p className="text-body-sm text-text-muted mb-2">Common reasons:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Reference number invalid",
            "Amount mismatch",
            "Payment not received",
            "Duplicate request",
          ].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-body-sm",
                "border border-border-default text-text-secondary",
                "hover:bg-bg-sunken hover:text-text-primary",
                "transition-colors duration-(--duration-fast)",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-b-0">
      <dt className="flex items-center gap-1.5 text-body-sm text-text-muted shrink-0 w-32">
        {icon && <span className="w-3.5 h-3.5">{icon}</span>}
        {label}
      </dt>
      <dd className="flex-1 text-body text-text-primary min-w-0 wrap-break-word">
        {value}
      </dd>
    </div>
  );
}

function formatMethod(method: string): string {
  return (
    {
      UPI: "UPI",
      BANK_TRANSFER: "Bank Transfer",
      CASH: "Cash",
      CHEQUE: "Cheque",
      OTHER: "Other",
    }[method] ?? method
  );
}
