"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import {
  recordPaymentAction,
  previewPaymentAction,
  type RecordPaymentState,
} from "../actions";
import type { PaymentPreview } from "@/lib/billing/getPaymentPreview";
import VillaSelector, { type VillaOption } from "./VillaSelector";
import MethodChips from "./MethodChips";
import AllocationPreview from "./AllocationPreview";
import Section from "@/components/organisms/Section";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { cn, formatCurrency } from "@/lib/utils/utils";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import { toast } from "@/components/atoms/Toast";

const initialState: RecordPaymentState = { status: "idle" };

const today = () => new Date().toISOString().split("T")[0];

interface Props {
  villas: VillaOption[];
  preselectedVillaId?: string;
}

export default function RecordPaymentForm({
  villas,
  preselectedVillaId,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(recordPaymentAction, initialState);

  // Form state
  const [villaId, setVillaId] = useState(preselectedVillaId ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAt, setPaidAt] = useState(today());

  // Preview state (live computed)
  const [preview, setPreview] = useState<PaymentPreview | null>(null);
  const [previewing, startPreview] = useTransition();

  const selectedVilla = villas.find((v) => v.villaId === villaId);
  const numericAmount = parseFloat(amount);
  const isReady = villaId && numericAmount > 0 && !isNaN(numericAmount);

  // Side effect: toast on success/error
  useEffect(() => {
    if (state.status === "success") {
      toast.success("Payment recorded", {
        description: state.message,
      });
    } else if (state.status === "error") {
      toast.error("Failed to record payment", {
        description: state.message,
      });
    }
  }, [state.status, state.message]);

  // Debounced preview fetch on amount/villa change
  useEffect(() => {
    if (!isReady) {
      setPreview(null);
      return;
    }

    const handle = setTimeout(() => {
      startPreview(async () => {
        const result = await previewPaymentAction(villaId, numericAmount);
        setPreview(result);
      });
    }, 400);

    return () => clearTimeout(handle);
  }, [villaId, numericAmount, isReady]);

  const fillFullOutstanding = () => {
    if (selectedVilla && selectedVilla.outstanding > 0) {
      setAmount(String(selectedVilla.outstanding));
    }
  };

  const resetForm = () => {
    setVillaId("");
    setAmount("");
    setMethod(PaymentMethod.UPI);
    setReference("");
    setNotes("");
    setPaidAt(today());
    setPreview(null);
    router.refresh();
  };

  // ─────────────────────────────────────────────────────────────
  // SUCCESS STATE — replace form with confirmation
  // ─────────────────────────────────────────────────────────────
  if (state.status === "success" && state.result) {
    return (
      <Card padding="lg" className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-h2 text-text-primary">Payment recorded</h2>
          <p className="text-body text-text-secondary mt-2">{state.message}</p>

          {/* Allocations summary */}
          {state.result.allocations.length > 0 && (
            <div className="w-full mt-6 p-4 rounded-md bg-bg-sunken border border-border-subtle">
              <p className="text-body-sm text-text-muted mb-3">Allocated as</p>
              <ul className="space-y-2 text-body-sm">
                {state.result.allocations.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-text-primary">{a.description}</span>
                    <span className="font-mono font-medium text-text-primary shrink-0">
                      {formatCurrency(a.amountAllocated)}
                    </span>
                  </li>
                ))}
                {state.result.unallocatedAmount > 0 && (
                  <li className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                    <span className="text-info">Credit balance</span>
                    <span className="font-mono font-medium text-info shrink-0">
                      {formatCurrency(state.result.unallocatedAmount)}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 mt-6 w-full md:w-auto">
            <Button asChild variant="ghost" size="lg">
              <Link href={"/admin/ledger"}>Back to Master Ledger</Link>
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={resetForm}
            >
              Record Another
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────────
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left: form */}
        <div className="md:col-span-7 space-y-6 md:space-y-8">
          {/* Section: Villa selection */}
          <Section
            title="Villa"
            description="Choose the villa receiving this payment"
            size="sm"
          >
            <VillaSelector
              villas={villas}
              value={villaId}
              onChange={setVillaId}
              required
            />

            {selectedVilla && (
              <div className="mt-3 flex items-center justify-between p-3 rounded-md bg-bg-sunken border border-border-subtle">
                <div>
                  <p className="text-body-sm text-text-muted">Outstanding</p>
                  <p
                    className={cn(
                      "text-h4 font-mono font-semibold",
                      selectedVilla.outstanding > 0
                        ? "text-danger"
                        : "text-success",
                    )}
                  >
                    {formatCurrency(selectedVilla.outstanding)}
                  </p>
                </div>
                {selectedVilla.outstanding > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={fillFullOutstanding}
                  >
                    Pay in full
                  </Button>
                )}
              </div>
            )}
          </Section>

          {/* Section: Payment details */}
          <Section
            title="Payment details"
            description="Amount, method, and reference"
            size="sm"
          >
            <div className="space-y-5">
              <FormField label="Amount" required>
                <Input
                  type="number"
                  name="amount"
                  prefix="₹"
                  placeholder="0"
                  inputSize="lg"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Method" required>
                <MethodChips value={method} onChange={setMethod} />
              </FormField>

              <FormField
                label="Reference number"
                helperText="UPI ID, transaction ID, cheque number, etc."
              >
                <Input
                  type="text"
                  name="reference"
                  placeholder="e.g., UPI-XYZ123"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </FormField>

              <FormField label="Date" required>
                <Input
                  type="date"
                  name="paidAt"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  required
                  max={today()}
                />
              </FormField>

              <FormField
                label="Notes"
                helperText="Internal notes for this payment (optional)"
              >
                <Input
                  type="text"
                  name="notes"
                  placeholder="Any extra context"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormField>
            </div>
          </Section>

          {/* Error banner */}
          {state.status === "error" && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border"
            >
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-danger">
                  Failed to record payment
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
              <Link href={"/admin/ledger"}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              size="lg"
              icon={<Sparkles className="w-4 h-4" />}
              disabled={!isReady}
            >
              Record Payment
            </Button>
          </div>
        </div>

        {/* Right: preview */}
        <div className="md:col-span-5">
          <AllocationPreview
            preview={preview}
            loading={previewing}
            isReady={!!isReady}
          />
        </div>
      </div>
    </form>
  );
}
