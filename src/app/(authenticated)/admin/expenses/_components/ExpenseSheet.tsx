"use client";

import {
  useState,
  useEffect,
  useTransition,
  useActionState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  AlertCircle,
  FileText,
  Calendar,
  Plus,
  X,
  Check,
} from "lucide-react";
import {
  editExpenseAction,
  createBatchExpensesAction,
  type ExpenseActionState,
  type CreateBatchExpensesState,
} from "../actions";
import { EXPENSE_CATEGORIES, isValidCategory } from "@/lib/expenses/categories";
import type { ExpenseRow } from "@/lib/expenses/getExpenses";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import { cn, formatCurrency } from "@/lib/utils/utils";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Badge from "@/components/atoms/Badge";
import IconButton from "@/components/atoms/IconButton";
import Input from "@/components/atoms/Input";

const editInitialState: ExpenseActionState = { status: "idle" };
const batchInitialState: CreateBatchExpensesState = { status: "idle" };

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

// ─────────────────────────────────────────────────────────────
//  Row state — local form state for each entry
// ─────────────────────────────────────────────────────────────

interface RowState {
  id: string; // local id for React keying
  category: string;
  amount: string; // string for input control
  description: string;
}

function makeNewRow(category?: string): RowState {
  return {
    id: Math.random().toString(36).slice(2),
    category: category ?? "",
    amount: "",
    description: "",
  };
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  expense?: ExpenseRow;
  allExpenses?: ExpenseRow[];
  initialMonth?: number;
  initialYear?: number;
}

export default function ExpenseSheet({
  open,
  onOpenChange,
  mode,
  expense,
  allExpenses = [],
  initialMonth,
  initialYear,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Edit mode uses single action; create mode uses batch action
  const [editState, editFormAction] = useActionState(
    editExpenseAction,
    editInitialState,
  );
  const [batchState, batchFormAction] = useActionState(
    createBatchExpensesAction,
    batchInitialState,
  );
  const [isPending, startTransition] = useTransition();

  // ─── Shared period state ───

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // ─── Rows (multi-entry) ───
  const [rows, setRows] = useState<RowState[]>([makeNewRow("Electricity")]);

  const alreadySavedCategories = useMemo(() => {
    return allExpenses
      .filter((e) => e.month === month && e.year === year)
      .filter((e) => !isEdit || e.id !== expense?.id)
      .map((e) => e.category)
      .filter((cat) => isValidCategory(cat)); // Hide stale categories
  }, [allExpenses, month, year, isEdit, expense?.id]);

  // ─── Reset when sheet opens ───

  useEffect(() => {
    if (!open) return;

    if (isEdit && expense) {
      setMonth(expense.month);
      setYear(expense.year);
      setRows([
        {
          id: "edit",
          category: expense.category,
          amount: String(expense.amount),
          description: expense.description ?? "",
        },
      ]);
    } else {
      setMonth(initialMonth ?? new Date().getMonth() + 1);
      setYear(initialYear ?? new Date().getFullYear());
      setRows([makeNewRow("Electricity")]);
    }
  }, [open, isEdit, expense, initialMonth, initialYear]);

  // ─── Handle action results ───
  useEffect(() => {
    if (editState.status === "success") {
      toast.success(editState.message ?? "Updated");
      onOpenChange(false);
      router.refresh();
    } else if (editState.status === "error" && !editState.errors) {
      toast.error(editState.message ?? "Failed to update");
    }
  }, [editState]);

  useEffect(() => {
    if (batchState.status === "success") {
      toast.success(batchState.message ?? "Saved");
      onOpenChange(false);
      router.refresh();
    } else if (batchState.status === "error" && !batchState.rowErrors) {
      toast.error(batchState.message ?? "Failed to save");
    }
  }, [batchState]);

  // ─── Row operations ───
  const updateRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    // Find first unused category as default for new row
    const usedCategories = new Set(rows.map((r) => r.category));
    const firstUnused = EXPENSE_CATEGORIES.find(
      (c) =>
        !usedCategories.has(c.value) &&
        !alreadySavedCategories.includes(c.value),
    );
    setRows((prev) => [...prev, makeNewRow(firstUnused?.value ?? "Misc")]);
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  };

  // ─── Per-row validation ───
  const rowValidation = useMemo(() => {
    return rows.map((row, idx) => {
      const errors: { category?: string; amount?: string } = {};

      // Check category
      if (!row.category) {
        errors.category = "Pick a category";
      } else if (alreadySavedCategories.includes(row.category)) {
        errors.category = `Already saved for ${MONTHS[month - 1]} ${year}`;
      } else {
        // Check for duplicates within batch
        const duplicateIndex = rows.findIndex(
          (r, i) => i < idx && r.category === row.category,
        );
        if (duplicateIndex !== -1) {
          errors.category = "Already added above";
        }
      }

      // Check amount
      const amount = parseFloat(row.amount);
      if (!row.amount || isNaN(amount) || amount <= 0) {
        errors.amount = "Enter amount";
      } else if (amount > 10_000_000) {
        errors.amount = "Too large";
      }

      return errors;
    });
  }, [rows, alreadySavedCategories, month, year]);

  // ─── Server-side row errors (from action response) ───
  const serverRowErrors = useMemo(() => {
    const map = new Map<number, string>();
    batchState.rowErrors?.forEach((e) => map.set(e.index, e.message));
    return map;
  }, [batchState.rowErrors]);

  // ─── Total preview ───
  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const n = parseFloat(r.amount);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [rows]);

  // ─── Validity check ───
  const allRowsValid = rowValidation.every((v) => !v.category && !v.amount);

  // ─── Submit ───
  const handleSubmit = () => {
    if (isEdit && expense) {
      // Edit mode — single entry
      const row = rows[0];
      const formData = new FormData();
      formData.set("id", expense.id);
      formData.set("month", String(month));
      formData.set("year", String(year));
      formData.set("category", row.category);
      formData.set("amount", row.amount);
      formData.set("description", row.description);
      startTransition(() => editFormAction(formData));
    } else {
      // Create mode — batch
      const entries = rows.map((r) => ({
        category: r.category,
        amount: parseFloat(r.amount),
        description: r.description.trim() || null,
      }));

      const formData = new FormData();
      formData.set("month", String(month));
      formData.set("year", String(year));
      formData.set("entries", JSON.stringify(entries));
      startTransition(() => batchFormAction(formData));
    }
  };

  // ─── Year options (current ± 2) ───
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  // ─── Form-level error ───
  const formError =
    (batchState.status === "error" &&
      !batchState.rowErrors &&
      batchState.message) ||
    (editState.status === "error" && !editState.errors && editState.message);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title={isEdit ? "Edit expense" : "Add expenses"}
      description={
        isEdit
          ? "Update the expense details."
          : "Add one or more expenses for a period. Categories must be unique per month."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 w-full md:items-center md:justify-between">
          {/* Total preview (only in create mode with multiple rows) */}
          {!isEdit && rows.length > 1 && (
            <div className="text-body-sm text-text-secondary">
              Total:{" "}
              <span className="font-mono font-semibold text-text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:ml-auto">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Save />}
              onClick={handleSubmit}
              disabled={!allRowsValid || isPending}
            >
              {isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : rows.length === 1
                    ? "Save expense"
                    : `Save ${rows.length} expenses`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Form-level error */}
        {formError && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">{formError}</p>
          </div>
        )}

        {/* Period (shared across all rows) */}
        <FormField
          label="Period"
          required
          helperText={
            !isEdit
              ? "All entries below will be saved for this period"
              : "When was this expense incurred?"
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <PeriodSelect
              label="Month"
              value={month}
              options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
              onChange={(v) => setMonth(v)}
              icon={<Calendar />}
            />
            <PeriodSelect
              label="Year"
              value={year}
              options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
              onChange={(v) => setYear(v)}
            />
          </div>
        </FormField>

        {/* Already-saved badge */}
        {!isEdit && alreadySavedCategories.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-info-muted border border-info-border">
            <Check className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-info font-medium">
                Already saved for {MONTHS[month - 1]} {year}:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {alreadySavedCategories.map((cat) => (
                  <Badge key={cat} size="sm" variant="info" outline>
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rows */}
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <ExpenseRowEditor
              key={row.id}
              row={row}
              rowIndex={idx}
              showDelete={!isEdit && rows.length > 1}
              clientErrors={rowValidation[idx]}
              serverError={serverRowErrors.get(idx)}
              alreadySavedCategories={alreadySavedCategories}
              monthLabel={MONTHS[month - 1]}
              onUpdate={(patch) => updateRow(row.id, patch)}
              onDelete={() => removeRow(row.id)}
            />
          ))}
        </div>

        {/* Add row button (create mode only) */}
        {!isEdit && (
          <Button
            variant="ghost"
            size="md"
            icon={<Plus />}
            onClick={addRow}
            fullWidth
            disabled={rows.length >= EXPENSE_CATEGORIES.length}
          >
            {rows.length >= EXPENSE_CATEGORIES.length
              ? "All categories added"
              : "Add another row"}
          </Button>
        )}
      </div>
    </ResponsiveSheet>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single row editor (used inside the multi-row form)
// ─────────────────────────────────────────────────────────────

interface ExpenseRowEditorProps {
  row: RowState;
  rowIndex: number;
  showDelete: boolean;
  clientErrors: { category?: string; amount?: string };
  serverError?: string;
  alreadySavedCategories: string[];
  monthLabel: string;
  onUpdate: (patch: Partial<RowState>) => void;
  onDelete: () => void;
}

function ExpenseRowEditor({
  row,
  rowIndex,
  showDelete,
  clientErrors,
  serverError,
  alreadySavedCategories,
  monthLabel,
  onUpdate,
  onDelete,
}: ExpenseRowEditorProps) {
  const hasErrors =
    !!clientErrors.category || !!clientErrors.amount || !!serverError;

  return (
    <div
      className={cn(
        "rounded-md border p-4 space-y-3",
        hasErrors
          ? "bg-danger-muted/30 border-danger-border"
          : "bg-bg-sunken border-border-subtle",
      )}
    >
      {/* Header row: number + delete */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
          Entry {rowIndex + 1}
        </p>
        {showDelete && (
          <IconButton
            label="Remove this row"
            icon={<X />}
            size="sm"
            variant="ghost"
            onClick={onDelete}
          />
        )}
      </div>

      {/* Category chips */}
      <FormField
        label="Category"
        required
        errorText={clientErrors.category || serverError}
      >
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((c) => {
            const isActive = row.category === c.value;
            const isAlreadySaved = alreadySavedCategories.includes(c.value);
            const Icon = c.icon;

            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onUpdate({ category: c.value })}
                disabled={isAlreadySaved}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  "px-3 h-9 rounded-full border",
                  "text-body-sm font-medium",
                  "transition-all duration-(--duration-fast)",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-brand-primary/30",
                  isAlreadySaved
                    ? "bg-bg-sunken text-text-muted border-border-subtle opacity-50 cursor-not-allowed"
                    : isActive
                      ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                      : "bg-transparent text-text-secondary border-border-default hover:bg-bg-elevated hover:text-text-primary",
                )}
                aria-pressed={isActive}
                title={
                  isAlreadySaved ? `Already saved for ${monthLabel}` : c.label
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
                {isAlreadySaved && <Check className="w-3 h-3 text-info" />}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Amount + description in grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField
          label="Amount"
          required
          errorText={clientErrors.amount}
          className="md:col-span-1"
        >
          <Input
            type="number"
            value={row.amount}
            onChange={(e) => onUpdate({ amount: e.target.value })}
            placeholder="0"
            prefix="₹"
            inputSize="md"
            min={1}
            step="0.01"
          />
        </FormField>

        <FormField
          label="Description"
          helperText="Optional"
          className="md:col-span-2"
        >
          <Input
            type="text"
            value={row.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="e.g., Meter #4521, vendor name"
            leadingIcon={<FileText />}
            inputSize="md"
            maxLength={500}
          />
        </FormField>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Period Select — themed dropdown
// ─────────────────────────────────────────────────────────────

interface PeriodSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
}

function PeriodSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  icon,
}: PeriodSelectProps<T>) {
  return (
    <div className="relative">
      <label className="text-micro uppercase tracking-wider text-text-muted block mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <select
          value={String(value)}
          onChange={(e) => {
            const next = options.find(
              (o) => String(o.value) === e.target.value,
            );
            if (next) onChange(next.value);
          }}
          className={cn(
            "w-full h-10",
            icon ? "pl-10 pr-9" : "pl-3 pr-9",
            "bg-bg-elevated border border-border-default rounded",
            "text-body text-text-primary",
            "appearance-none cursor-pointer",
            "transition-colors duration-[var(--duration-fast)]",
            "hover:border-border-strong",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
          )}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
