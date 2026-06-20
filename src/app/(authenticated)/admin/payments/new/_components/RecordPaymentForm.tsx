// app/(authenticated)/(admin)/admin/payments/new/_components/RecordPaymentForm.tsx
"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowRight,
  Wallet,
  Loader2,
} from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import {
  recordPaymentAction,
  previewPaymentAction,
  type RecordPaymentState,
} from "../actions";
import type { PaymentPreview } from "@/lib/billing/getPaymentPreview";

// ─── Helpers ──────────────────────────────────────────────

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const today = () => new Date().toISOString().split("T")[0];

// ─── Types ────────────────────────────────────────────────

interface VillaOption {
  villaId: string;
  villaNo: number;
  ownerName: string;
  userId: string | null;
  residentName: string | null;
  outstanding: number;
}

interface Props {
  villas: VillaOption[];
  preselectedVillaId?: string;
}

const initialState: RecordPaymentState = { status: "idle" };

// ─── Component ────────────────────────────────────────────

export default function RecordPaymentForm({
  villas,
  preselectedVillaId,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(recordPaymentAction, initialState);

  const [villaId, setVillaId] = useState(preselectedVillaId ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAt, setPaidAt] = useState(today());

  const [preview, setPreview] = useState<PaymentPreview | null>(null);
  const [previewing, startPreview] = useTransition();

  const selectedVilla = villas.find((v) => v.villaId === villaId);
  const isSuccess = state.status === "success";

  const onPreview = () => {
    const amt = parseFloat(amount);
    if (!villaId || !amt || amt <= 0) {
      setPreview(null);
      return;
    }
    startPreview(async () => {
      const result = await previewPaymentAction(villaId, amt);
      setPreview(result);
    });
  };

  const fillFullOutstanding = () => {
    if (selectedVilla) {
      setAmount(String(selectedVilla.outstanding));
      setPreview(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────────────────
  if (isSuccess && state.result) {
    return (
      <section className="bg-slate-900/30 border border-emerald-500/30 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-emerald-200">
              Payment recorded
            </h2>
            <p className="text-sm text-emerald-300/80 mt-1">{state.message}</p>
          </div>
        </div>

        {state.result.allocations.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-md p-4">
            <p className="text-sm text-slate-300 font-medium mb-2">
              Allocations
            </p>
            <ul className="space-y-1.5 text-sm">
              {state.result.allocations.map((a, i) => (
                <li key={i} className="flex justify-between text-slate-300">
                  <span>{a.description}</span>
                  <span className="font-mono text-emerald-300">
                    {inr(a.amountAllocated)}
                  </span>
                </li>
              ))}
              {state.result.unallocatedAmount > 0 && (
                <li className="flex justify-between text-violet-300 pt-2 border-t border-slate-700/40">
                  <span>Credit balance (overpayment)</span>
                  <span className="font-mono">
                    {inr(state.result.unallocatedAmount)}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/ledger")}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-sm font-medium"
          >
            Back to Master Ledger
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm"
          >
            Record Another
          </button>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────
  return (
    <section className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
      <form action={formAction} className="space-y-5">
        {/* ── Villa selector ── */}
        <Field label="Villa" required>
          <select
            name="villaId"
            value={villaId}
            onChange={(e) => {
              setVillaId(e.target.value);
              setPreview(null);
            }}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="">Select villa...</option>
            {villas.map((v) => {
              const personLabel = v.residentName ?? v.ownerName;
              const claimedTag = v.residentName ? "" : " [unclaimed]";
              return (
                <option key={v.villaId} value={v.villaId}>
                  Villa {v.villaNo} — {personLabel}
                  {claimedTag}
                  {v.outstanding > 0
                    ? ` (owes ${inr(v.outstanding)})`
                    : " (no dues)"}
                </option>
              );
            })}
          </select>

          {selectedVilla && (
            <div className="mt-2 flex items-center justify-between bg-slate-800/40 border border-slate-700/40 rounded-md px-3 py-2 text-sm">
              <span className="text-slate-400">Outstanding:</span>
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-semibold ${
                    selectedVilla.outstanding > 0
                      ? "text-red-300"
                      : "text-emerald-300"
                  }`}
                >
                  {inr(selectedVilla.outstanding)}
                </span>
                {selectedVilla.outstanding > 0 && (
                  <button
                    type="button"
                    onClick={fillFullOutstanding}
                    className="text-xs px-2 py-0.5 bg-violet-600/30 text-violet-200 rounded hover:bg-violet-600/50"
                  >
                    Use full
                  </button>
                )}
              </div>
            </div>
          )}
        </Field>

        {/* ── Amount + Method ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Amount (₹)" required>
            <input
              type="number"
              name="amount"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setPreview(null);
              }}
              required
              placeholder="3600"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </Field>

          <Field label="Method" required>
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* ── Reference + Date ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Reference (optional)">
            <input
              type="text"
              name="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="UPI ref / cheque no"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </Field>

          <Field label="Date" required>
            <input
              type="date"
              name="paidAt"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
              max={today()}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </Field>
        </div>

        {/* ── Notes ── */}
        <Field label="Notes (optional)">
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional information"
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
          />
        </Field>

        {/* ── Preview ── */}
        <div className="border-t border-slate-800/40 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">
              Allocation Preview
            </p>
            <button
              type="button"
              onClick={onPreview}
              disabled={!villaId || !amount || previewing}
              className="flex items-center gap-2 text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-200 rounded-md"
            >
              {previewing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Calculator className="w-3 h-3" />
              )}
              Preview
            </button>
          </div>

          {preview && <PreviewBox preview={preview} />}
          {!preview && (
            <p className="text-xs text-slate-500">
              Click Preview to see how this payment will be allocated.
            </p>
          )}
        </div>

        {/* ── Error ── */}
        {state.status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{state.message}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md font-medium text-sm"
          >
            Record Payment
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/ledger")}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

function PreviewBox({ preview }: { preview: PaymentPreview }) {
  if (preview.allocations.length === 0 && preview.unallocatedAmount === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-md p-3 text-sm text-slate-400">
        Nothing to allocate. This villa has no outstanding bills.
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-md p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
        <Wallet className="w-4 h-4 text-violet-400" />
        This payment will be allocated as:
      </div>

      <ul className="space-y-1.5 text-sm pl-6">
        {preview.allocations.map((a, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ArrowRight className="w-3 h-3 text-slate-500" />
              {a.description}
              {a.fullyCovered && (
                <span className="text-xs text-emerald-400">(completes it)</span>
              )}
            </span>
            <span className="font-mono text-emerald-300 whitespace-nowrap">
              {inr(a.amountAllocated)}
            </span>
          </li>
        ))}

        {preview.unallocatedAmount > 0 && (
          <li className="flex justify-between gap-2 pt-2 border-t border-slate-700/40">
            <span className="flex items-center gap-1.5 text-violet-300">
              <ArrowRight className="w-3 h-3" />
              Credit balance (overpayment)
            </span>
            <span className="font-mono text-violet-300">
              {inr(preview.unallocatedAmount)}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
