"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateBillsAction, type GenerateBillsActionState } from "../actions";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Wallet,
} from "lucide-react";
import type { BillsPreview } from "@/lib/billing/getBillsPreview";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const monthName = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "long" });

const initialState: GenerateBillsActionState = { status: "idle" };

interface Props {
  initialMonth: number;
  initialYear: number;
  preview: BillsPreview;
}

export default function GenerateBillsForm({
  initialMonth,
  initialYear,
  preview,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(generateBillsAction, initialState);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const handleSubmit = (formData: FormData) => {
    setShowConfirm(false);
    formAction(formData);
  };

  const onPeriodChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
    setShowConfirm(false);
    const url = `/admin/bills?month=${newMonth}&year=${newYear}`;
    startTransition(() => router.replace(url));
  };

  const canGenerate = preview.newBillsCount > 0;

  return (
    <section className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 space-y-5">
      {/* ── Period selector ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Calendar className="w-5 h-5 text-slate-400" />
        <label className="text-sm text-slate-300">Period:</label>
        <select
          value={month}
          onChange={(e) => onPeriodChange(parseInt(e.target.value), year)}
          disabled={isPending}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {monthName(m)}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => onPeriodChange(month, parseInt(e.target.value))}
          disabled={isPending}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {isPending && (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        )}
      </div>

      {/* ── Preview ── */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-md p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Wallet className="w-4 h-4 text-violet-400" />
          Preview for {monthName(month)} {year}
        </div>
        <ul className="text-sm text-slate-400 space-y-1 ml-6">
          <li>
            • Rate:{" "}
            <span className="text-slate-200 font-mono">
              ₹{preview.ratePerSqFt}/sqft
            </span>
          </li>
          <li>
            • Eligible villas:{" "}
            <span className="text-slate-200">{preview.eligibleVillas}</span>
          </li>
          <li>
            • Already billed:{" "}
            <span className="text-slate-200">{preview.alreadyBilled}</span>
          </li>
          <li>
            • New bills to create:{" "}
            <span className="text-violet-300 font-semibold">
              {preview.newBillsCount}
            </span>
          </li>
          <li>
            • Total amount:{" "}
            <span className="text-emerald-300 font-mono font-semibold">
              {inr(preview.totalAmount)}
            </span>
          </li>
        </ul>
      </div>

      {/* ── Result message ── */}
      {state.status === "success" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-emerald-200 font-medium">Success</p>
            <p className="text-emerald-300/80 text-sm mt-1">{state.message}</p>
            {state.result && state.result.totalAmount > 0 && (
              <p className="text-emerald-300/80 text-sm mt-1">
                Total billed:{" "}
                <span className="font-mono">
                  {inr(state.result.totalAmount)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-200 font-medium">Failed</p>
            <p className="text-red-300/80 text-sm mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {/* ── Generate button + confirmation ── */}
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={!canGenerate || isPending}
          className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
        >
          {canGenerate
            ? `Generate ${preview.newBillsCount} Bills`
            : "Nothing to generate"}
        </button>
      ) : (
        <ConfirmGenerate
          month={month}
          year={year}
          preview={preview}
          onCancel={() => setShowConfirm(false)}
          formAction={handleSubmit}
        />
      )}
    </section>
  );
}

// ─── Confirmation step (form submits to server action) ───────

function ConfirmGenerate({
  month,
  year,
  preview,
  onCancel,
  formAction,
}: {
  month: number;
  year: number;
  preview: BillsPreview;
  onCancel: () => void;
  formAction: (formData: FormData) => void;
}) {
  return (
    <form
      action={formAction}
      className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 space-y-3"
    >
      <p className="text-amber-200 font-medium">Confirm generation</p>
      <p className="text-amber-100/80 text-sm">
        This will create <strong>{preview.newBillsCount} bills</strong> for{" "}
        {monthName(month)} {year} totaling{" "}
        <strong>{inr(preview.totalAmount)}</strong>.
      </p>
      <p className="text-amber-100/60 text-xs">
        Already-billed villas will be skipped. This is safe to retry.
      </p>

      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />

      <div className="flex gap-2 pt-2">
        <SubmitButton />
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Submit button shows pending state ───────────────────────

function SubmitButton() {
  // Native form pending state — works without useFormStatus too
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
    >
      Yes, Generate Bills
    </button>
  );
}

// Helper
