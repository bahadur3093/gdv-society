"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { getCategoryConfig } from "@/lib/expenses/categories";
import type { ExpenseRow } from "@/lib/expenses/getExpenses";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import Badge from "@/components/atoms/Badge";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";
import Button from "@/components/atoms/Button";
import IconButton from "@/components/atoms/IconButton";

interface MonthGroup {
  year: number;
  month: number;
  total: number;
  expenses: ExpenseRow[];
}

interface Props {
  rows: ExpenseRow[];
  onEdit: (row: ExpenseRow) => void;
  onDelete: (row: ExpenseRow) => void;
  onAddToMonth: (month: number, year: number) => void;
}

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

export default function GroupedExpensesList({
  rows,
  onEdit,
  onDelete,
  onAddToMonth,
}: Props) {
  // ─── Group by (year, month) ───
  const groups: MonthGroup[] = useMemo(() => {
    const map = new Map<string, MonthGroup>();

    for (const row of rows) {
      const key = `${row.year}-${row.month}`;
      const existing = map.get(key);
      if (existing) {
        existing.total += row.amount;
        existing.expenses.push(row);
      } else {
        map.set(key, {
          year: row.year,
          month: row.month,
          total: row.amount,
          expenses: [row],
        });
      }
    }

    // Sort: most recent first
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [rows]);

  // ─── Expanded state (all expanded by default) ───
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // ─── Empty state ───
  if (rows.length === 0) {
    return (
      <Card padding="md">
        <EmptyState
          size="md"
          icon={<Calendar />}
          title="No expenses to show"
          description="Switch filters or add new entries."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const key = `${group.year}-${group.month}`;
        const isCollapsed = collapsedKeys.has(key);
        const monthLabel = `${MONTHS[group.month - 1]} ${group.year}`;
        const isCurrentMonth =
          group.month === new Date().getMonth() + 1 &&
          group.year === new Date().getFullYear();

        return (
          <Card key={key} padding="none" className="overflow-hidden">
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(key)}
              className={cn(
                "w-full flex items-center gap-3",
                "px-4 py-3 md:px-5 md:py-4",
                "bg-bg-sunken hover:bg-bg-sunken/70",
                "border-b border-border-subtle",
                "transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:bg-bg-sunken/70",
                isCollapsed && "border-b-0",
              )}
              aria-expanded={!isCollapsed}
            >
              {/* Chevron */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-text-secondary shrink-0",
                  "transition-transform duration-(--duration-fast)",
                  isCollapsed && "-rotate-90",
                )}
              />

              {/* Month label */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-h4 text-text-primary font-semibold">
                    {monthLabel}
                  </span>
                  {isCurrentMonth && (
                    <Badge size="sm" variant="brand" outline>
                      Current
                    </Badge>
                  )}
                  <Badge size="sm" variant="neutral">
                    {group.expenses.length}{" "}
                    {group.expenses.length === 1 ? "entry" : "entries"}
                  </Badge>
                </div>
              </div>

              {/* Total amount */}
              <div className="text-right shrink-0">
                <p className="font-mono font-semibold text-h4 text-text-primary">
                  {formatCurrency(group.total)}
                </p>
              </div>
            </button>

            {/* Group rows */}
            {!isCollapsed && (
              <div className="divide-y divide-border-subtle">
                {group.expenses.map((expense) => (
                  <ExpenseGroupRow
                    key={expense.id}
                    expense={expense}
                    onEdit={() => onEdit(expense)}
                    onDelete={() => onDelete(expense)}
                  />
                ))}

                {/* Quick add row */}
                <div className="px-4 py-3 md:px-5 md:py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus />}
                    onClick={() => onAddToMonth(group.month, group.year)}
                    fullWidth
                  >
                    Add to {MONTHS[group.month - 1]} {group.year}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single row inside a month group
// ─────────────────────────────────────────────────────────────

interface ExpenseGroupRowProps {
  expense: ExpenseRow;
  onEdit: () => void;
  onDelete: () => void;
}

function ExpenseGroupRow({ expense, onEdit, onDelete }: ExpenseGroupRowProps) {
  const config = getCategoryConfig(expense.category);
  const Icon = config.icon;

  const colorMap: Record<typeof config.accent, string> = {
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    red: "bg-red-500/15 text-red-600 dark:text-red-400",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    brand: "bg-brand-primary/15 text-brand-primary",
    neutral: "bg-bg-sunken text-text-secondary",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-3.5">
      {/* Category icon */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          colorMap[config.accent],
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Description + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-primary truncate">
          {expense.category}
        </p>
        {expense.description ? (
          <p className="text-body-sm text-text-muted truncate">
            {expense.description}
          </p>
        ) : (
          <p className="text-body-sm text-text-muted italic">No notes</p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold text-body text-text-primary">
          {formatCurrency(expense.amount)}
        </p>
        <p className="text-text-muted text-xs">
          {formatRelativeTime(expense.updatedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton
          label="Edit expense"
          icon={<Edit />}
          size="sm"
          variant="ghost"
          onClick={onEdit}
        />
        <IconButton
          label="Delete expense"
          icon={<Trash2 />}
          size="sm"
          variant="ghost"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
