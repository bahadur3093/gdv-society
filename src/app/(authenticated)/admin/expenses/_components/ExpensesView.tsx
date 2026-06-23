"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Wallet,
  TrendingDown,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import { deleteExpenseAction } from "../actions";
import { getCategoryConfig } from "@/lib/expenses/categories";
import ExpenseSheet from "./ExpenseSheet";
import type { ExpenseRow, ExpenseStats } from "@/lib/expenses/getExpenses";
import Tabs, { TabItem } from "@/components/molecules/Tabs";
import { toast } from "@/components/atoms/Toast";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import GroupedExpensesList from "./ExpensesList";

type TimeFilter = "THIS_MONTH" | "LAST_MONTH" | "LAST_6M" | "ALL";

interface Props {
  rows: ExpenseRow[];
  stats: ExpenseStats;
}

export default function ExpensesView({ rows, stats }: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<TimeFilter>("THIS_MONTH");

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<ExpenseRow | undefined>(
    undefined,
  );

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");

  // Period overrides for sheet (when adding to a specific month)
  const [sheetInitialMonth, setSheetInitialMonth] = useState<
    number | undefined
  >(undefined);
  const [sheetInitialYear, setSheetInitialYear] = useState<number | undefined>(
    undefined,
  );

  // ─── Filter rows by time period ───
  const filtered = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prev.getMonth() + 1;
    const prevYear = prev.getFullYear();
    const sixAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixAgoTs = sixAgo.getTime();

    switch (filter) {
      case "THIS_MONTH":
        return rows.filter(
          (r) => r.month === currentMonth && r.year === currentYear,
        );
      case "LAST_MONTH":
        return rows.filter((r) => r.month === prevMonth && r.year === prevYear);
      case "LAST_6M":
        return rows.filter((r) => {
          const ts = new Date(r.year, r.month - 1, 1).getTime();
          return ts >= sixAgoTs;
        });
      case "ALL":
      default:
        return rows;
    }
  }, [rows, filter]);

  // ─── Tabs counts ───
  const counts = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixAgoTs = sixAgo.getTime();

    return {
      thisMonth: rows.filter(
        (r) => r.month === currentMonth && r.year === currentYear,
      ).length,
      lastMonth: rows.filter(
        (r) => r.month === prev.getMonth() + 1 && r.year === prev.getFullYear(),
      ).length,
      last6m: rows.filter((r) => {
        const ts = new Date(r.year, r.month - 1, 1).getTime();
        return ts >= sixAgoTs;
      }).length,
      all: rows.length,
    };
  }, [rows]);

  // ─── Tabs ───
  const tabs: TabItem[] = [
    {
      key: "THIS_MONTH",
      label: "This month",
      badge:
        counts.thisMonth > 0
          ? { label: String(counts.thisMonth), variant: "brand" }
          : undefined,
    },
    {
      key: "LAST_MONTH",
      label: "Last month",
      badge:
        counts.lastMonth > 0
          ? { label: String(counts.lastMonth), variant: "neutral" }
          : undefined,
    },
    {
      key: "LAST_6M",
      label: "Last 6 months",
      badge:
        counts.last6m > 0
          ? { label: String(counts.last6m), variant: "neutral" }
          : undefined,
    },
    {
      key: "ALL",
      label: "All time",
      badge:
        counts.all > 0
          ? { label: String(counts.all), variant: "neutral" }
          : undefined,
    },
  ];

  // ─── Handlers ───
  const handleAddNew = (initialMonth?: number, initialYear?: number) => {
    setSheetMode("create");
    setEditTarget(undefined);
    setSheetInitialMonth(initialMonth);
    setSheetInitialYear(initialYear);
    setSheetOpen(true);
  };

  const handleEdit = (row: ExpenseRow) => {
    setSheetMode("edit");
    setEditTarget(row);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteExpenseAction(deleteTarget.id);
    setIsDeleting(false);

    if (result.status === "success") {
      toast.success(result.message ?? "Deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  };

  // ─── Columns ───
  const columns: ProTableColumn<ExpenseRow>[] = useMemo(
    () => [
      {
        key: "period",
        label: "Period",
        sortable: true,
        sortAccessor: (r) => r.year * 100 + r.month,
        width: 140,
        desktop: (r) => (
          <div>
            <div className="font-medium text-text-primary">
              {monthName(r.month)} {r.year}
            </div>
            <div className="text-text-muted text-xs">
              {formatRelativeTime(r.createdAt)}
            </div>
          </div>
        ),
        mobilePrimary: (r) => `${monthName(r.month)} ${r.year}`,
        mobileSecondary: (r) => formatRelativeTime(r.createdAt),
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        sortAccessor: (r) => r.category,
        desktop: (r) => <CategoryBadge category={r.category} />,
        mobileBadge: (r) => <CategoryBadge category={r.category} size="sm" />,
      },
      {
        key: "description",
        label: "Description",
        desktop: (r) =>
          r.description ? (
            <div className="text-body-sm text-text-secondary truncate max-w-70">
              {r.description}
            </div>
          ) : (
            <span className="text-text-muted text-body-sm italic">
              No notes
            </span>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.amount,
        desktop: (r) => (
          <span className="font-mono font-semibold text-text-primary">
            {formatCurrency(r.amount)}
          </span>
        ),
        mobileAccent: (r) => (
          <span className="font-mono font-semibold text-text-primary">
            {formatCurrency(r.amount)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="This Month"
          value={stats.thisMonthTotal}
          format="currency-compact"
          description={`${counts.thisMonth} entries`}
          icon={<Wallet />}
          accent="brand"
        />
        <StatCard
          label="Last Month"
          value={stats.lastMonthTotal}
          format="currency-compact"
          description={
            stats.monthDeltaPercent !== 0
              ? `${stats.monthDeltaPercent > 0 ? "+" : ""}${stats.monthDeltaPercent.toFixed(
                  1,
                )}% vs last`
              : "Same as last"
          }
          icon={stats.monthDeltaPercent > 0 ? <TrendingUp /> : <TrendingDown />}
          accent={
            stats.monthDeltaPercent > 10
              ? "danger"
              : stats.monthDeltaPercent < -10
                ? "success"
                : "neutral"
          }
        />
        <StatCard
          label="Avg Monthly"
          value={stats.avgMonthly6m}
          format="currency-compact"
          description="Last 6 months"
          icon={<Calendar />}
          accent="info"
        />
        <StatCard
          label="Largest This Month"
          value={stats.largestCategoryThisMonth?.amount ?? 0}
          format="currency-compact"
          description={stats.largestCategoryThisMonth?.category ?? "No data"}
          icon={<Award />}
          accent="warning"
        />
      </div>

      {/* ─── Tabs + Add button ─── */}

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <Tabs
            items={tabs}
            value={filter}
            onChange={(v) => setFilter(v as TimeFilter)}
            variant="underline"
            size="md"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div
            className={cn(
              "inline-flex p-0.5 rounded-md",
              "bg-bg-sunken border border-border-subtle",
            )}
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 rounded",
                "text-body-sm font-medium",
                "transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary/30",
                viewMode === "flat"
                  ? "bg-bg-elevated text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
              aria-pressed={viewMode === "flat"}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Flat</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grouped")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 rounded",
                "text-body-sm font-medium",
                "transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary/30",
                viewMode === "grouped"
                  ? "bg-bg-elevated text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
              aria-pressed={viewMode === "grouped"}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">By month</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus />}
            onClick={() => handleAddNew()}
          >
            Add expense
          </Button>
        </div>
      </div>

      {/* ─── Table ─── */}

      {viewMode === "flat" ? (
        <ProTable<ExpenseRow>
          data={filtered}
          columns={columns}
          rowKey="id"
          search
          searchPlaceholder="Search by category, description…"
          searchKeys={["category", "description"]}
          defaultSort={{ key: "period", direction: "desc" }}
          density="comfortable"
          stickyHeader
          maxHeight="60vh"
          emptyTitle={
            filter === "THIS_MONTH"
              ? "No expenses this month yet"
              : filter === "LAST_MONTH"
                ? "No expenses recorded for last month"
                : filter === "LAST_6M"
                  ? "No expenses in the last 6 months"
                  : "No expenses recorded"
          }
          emptyDescription={
            filter === "THIS_MONTH"
              ? "Add the first expense for this month."
              : "Try a different time period."
          }
          actions={(row) => [
            {
              label: "Edit",
              icon: <Edit />,
              onClick: () => handleEdit(row),
            },
            {
              label: "Delete",
              icon: <Trash2 />,
              variant: "danger",
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ) : (
        <GroupedExpensesList
          rows={filtered}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onAddToMonth={(month, year) => handleAddNew(month, year)}
        />
      )}

      {/* ─── Edit/Create sheet ─── */}
      <ExpenseSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSheetInitialMonth(undefined);
            setSheetInitialYear(undefined);
          }
        }}
        mode={sheetMode}
        expense={editTarget}
        allExpenses={rows}
        initialMonth={sheetInitialMonth}
        initialYear={sheetInitialYear}
      />

      {/* ─── Delete confirmation ─── */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title="Delete expense?"
        description={
          deleteTarget
            ? `This ${deleteTarget.category} entry for ${monthName(
                deleteTarget.month,
              )} ${deleteTarget.year} (${formatCurrency(
                deleteTarget.amount,
              )}) will be permanently removed.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete entry"}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-warning-muted border border-warning-border">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-body-sm text-warning">
              This action cannot be undone. Residents will see the updated
              total.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Category Badge — uses icon + tinted bg per category
// ─────────────────────────────────────────────────────────────

function CategoryBadge({
  category,
  size = "md",
}: {
  category: string;
  size?: "sm" | "md";
}) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  const colorMap: Record<typeof config.accent, string> = {
    amber:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    red: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    emerald:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    violet:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
    orange:
      "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    brand: "bg-brand-primary/15 text-brand-primary border-brand-primary/30",
    neutral: "bg-bg-sunken text-text-secondary border-border-default",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full border font-medium whitespace-nowrap",
        colorMap[config.accent],
        size === "sm" ? "px-2 py-0.5 text-micro" : "px-3 py-1 text-body-sm",
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{category}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("en-IN", {
    month: "short",
  });
}
