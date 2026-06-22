"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
  Wallet,
  FileCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { generateBillsAction, type GenerateBillsActionState } from "../actions";
import type { BillsPreview } from "@/lib/billing/getBillsPreview";

const initialState: GenerateBillsActionState = { status: "idle" };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

  // Period selector → re-fetch preview via URL
  const onPeriodChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
    setShowConfirm(false);
    const url = `/admin/bills?month=${newMonth}&year=${newYear}`;
    startTransition(() => router.replace(url));
  };

  const handleSubmit = (formData: FormData) => {
    setShowConfirm(false);
    formAction(formData);
  };

  const canGenerate = preview.newBillsCount > 0;
  const totalAmount = preview.totalAmount;

  // Toast on success/error
  if (state.status === "success" && state.result) {
    toast.success("Bills generated", {
      description: `${state.result.generatedCount} new bills created`,
    });
  } else if (state.status === "error") {
    toast.error("Generation failed", {
      description: state.message,
    });
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ─── Step 1: Period ─── */}
      <Section
        title="Select Period"
        description="Choose the month and year to generate bills for"
        icon={<Calendar />}
      >
        <Card padding="md">
          <div className="flex flex-wrap items-center gap-4">
            <PeriodSelect
              label="Month"
              value={month}
              options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
              onChange={(v) => onPeriodChange(v, year)}
              disabled={isPending}
              minWidth="180px"
            />
            <PeriodSelect
              label="Year"
              value={year}
              options={[year - 1, year, year + 1].map((y) => ({
                value: y,
                label: String(y),
              }))}
              onChange={(v) => onPeriodChange(month, v)}
              disabled={isPending}
              minWidth="120px"
            />
            {isPending && (
              <span className="inline-flex items-center gap-1.5 text-body-sm text-text-muted ml-auto">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating preview…
              </span>
            )}
          </div>
        </Card>
      </Section>

      {/* ─── Step 2: Preview ─── */}
      <Section
        title="Preview"
        description={`Bills for ${MONTHS[month - 1]} ${year}`}
        icon={<FileCheck />}
        badge={
          canGenerate
            ? { label: "Ready", variant: "success" }
            : { label: "No changes", variant: "neutral" }
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="Eligible Villas"
            value={preview.eligibleVillas}
            format="number"
            description="Billable + has area"
            icon={<Users />}
            accent="info"
          />
          <StatCard
            label="To Generate"
            value={preview.newBillsCount}
            format="number"
            description={
              preview.alreadyBilled > 0
                ? `${preview.alreadyBilled} already billed`
                : "No skips"
            }
            icon={<FileCheck />}
            accent={canGenerate ? "brand" : "neutral"}
          />
          <StatCard
            label="Total Amount"
            value={totalAmount}
            format="currency-compact"
            description={`₹${preview.ratePerSqFt}/sqft rate`}
            icon={<Wallet />}
            accent="success"
          />
          <StatCard
            label="Already Billed"
            value={preview.alreadyBilled}
            format="number"
            description="Will be skipped"
            icon={<CheckCircle2 />}
            accent="neutral"
          />
        </div>
      </Section>

      {/* ─── Result feedback (inline, persistent after action) ─── */}
      {state.status === "success" && state.result && (
        <SuccessBanner result={state.result} />
      )}
      {state.status === "error" && (
        <ErrorBanner message={state.message ?? "Generation failed"} />
      )}

      {/* ─── Step 3: Action ─── */}
      <Card padding="md">
        {!showConfirm ? (
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-text-primary">
                {canGenerate
                  ? `Generate ${preview.newBillsCount} bill${preview.newBillsCount === 1 ? "" : "s"} totaling ${formatCurrency(totalAmount)}`
                  : "Nothing to generate"}
              </p>
              <p className="text-body-sm text-text-secondary mt-0.5">
                {canGenerate
                  ? `Bills will be created with ${MONTHS[month - 1]} ${year} as the period.`
                  : `All eligible villas already have bills for ${MONTHS[month - 1]} ${year}.`}
              </p>
            </div>
            <Button
              size="lg"
              icon={<Sparkles className="w-4 h-4" />}
              disabled={!canGenerate}
              onClick={() => setShowConfirm(true)}
            >
              Generate Bills
            </Button>
          </div>
        ) : (
          <form action={handleSubmit}>
            <ConfirmGenerate
              month={month}
              year={year}
              monthName={MONTHS[month - 1]}
              preview={preview}
              onCancel={() => setShowConfirm(false)}
            />
          </form>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Period select — clean dropdown using design tokens
// ─────────────────────────────────────────────────────────────

function PeriodSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  minWidth,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  disabled?: boolean;
  minWidth?: string;
}) {
  return (
    <label className="flex items-center gap-2.5">
      <span className="text-body-sm text-text-secondary font-medium">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        style={{ minWidth }}
        className={cn(
          "h-10 px-3 pr-8",
          "rounded bg-bg-elevated",
          "border border-border-default",
          "text-body text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-(--duration-fast)",
          "appearance-none cursor-pointer",
          "bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")] bg-no-repeat",
          "bg-size-[16px] bg-position-[right_8px_center]",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
//  Confirmation step (form submits to server action)
// ─────────────────────────────────────────────────────────────

function ConfirmGenerate({
  month,
  year,
  monthName,
  preview,
  onCancel,
}: {
  month: number;
  year: number;
  monthName: string;
  preview: BillsPreview;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />

      <div className="flex items-start gap-3 p-4 rounded-md bg-warning-muted border border-warning-border">
        <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-warning">
            Confirm generation
          </p>
          <p className="text-body-sm text-warning/90 mt-0.5">
            This will create <strong>{preview.newBillsCount}</strong> bills for{" "}
            <strong>
              {monthName} {year}
            </strong>{" "}
            totaling <strong>{formatCurrency(preview.totalAmount)}</strong>.
            Villas already billed will be skipped. This action is safe to retry.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton billCount={preview.newBillsCount} />
      </div>
    </div>
  );
}

function SubmitButton({ billCount }: { billCount: number }) {
  return (
    <Button
      type="submit"
      variant="primary"
      icon={<Sparkles className="w-4 h-4" />}
    >
      Yes, generate {billCount} bill{billCount === 1 ? "" : "s"}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
//  Success / error banners
// ─────────────────────────────────────────────────────────────

function SuccessBanner({
  result,
}: {
  result: NonNullable<GenerateBillsActionState["result"]>;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 p-4 rounded-md",
        "bg-success-muted border border-success-border",
      )}
    >
      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-success">
          Bills generated successfully
        </p>
        <p className="text-body-sm text-success/90 mt-0.5">
          {result.generatedCount} new bill
          {result.generatedCount === 1 ? "" : "s"} created
          {result.skippedCount > 0 &&
            `, ${result.skippedCount} already billed and skipped`}
          {result.totalAmount > 0 &&
            ` • Total: ${formatCurrency(result.totalAmount)}`}
        </p>
      </div>
      <Button
        asChild
        variant="ghost"
        size="sm"
        icon={<ChevronRight className="w-4 h-4" />}
        iconPosition="right"
      >
        <Link href={"/admin/ledger"}>View Master Ledger</Link>
      </Button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-md",
        "bg-danger-muted border border-danger-border",
      )}
    >
      <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-danger">Generation failed</p>
        <p className="text-body-sm text-danger/90 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Link import (Next.js — for success banner CTA)
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { toast } from "@/components/atoms/Toast";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import StatCard from "@/components/molecules/StatCard";
import { cn, formatCurrency } from "@/lib/utils/utils";
import Button from "@/components/atoms/Button";
