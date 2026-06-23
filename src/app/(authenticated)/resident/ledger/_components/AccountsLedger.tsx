"use client";

import { useState, useMemo } from "react";
import {
  Receipt,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import type {
  ResidentLedger,
  PassbookEntry,
} from "@/lib/billing/getResidentLedger";
import Tabs, { TabItem } from "@/components/molecules/Tabs";
import { cn, formatCurrency, formatDate } from "@/lib/utils/utils";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import BottomSheet from "@/components/organisms/BottomSheet";

type EntryFilter = "ALL" | "BILL" | "PAYMENT" | "LEVY" | "ADJUSTMENT";

interface Props {
  data: ResidentLedger;
}

export default function AccountsLedger({ data }: Props) {
  const { resident, villa, summary, entries } = data;

  const [filter, setFilter] = useState<EntryFilter>("ALL");
  const [selectedEntry, setSelectedEntry] = useState<PassbookEntry | null>(
    null,
  );

  // ─── Counts per type ───
  const counts = useMemo(() => {
    const result = {
      ALL: entries.length,
      BILL: 0,
      PAYMENT: 0,
      LEVY: 0,
      ADJUSTMENT: 0,
    };
    for (const e of entries) {
      if (e.type in result) {
        result[e.type as keyof typeof result] += 1;
      }
    }
    return result;
  }, [entries]);

  // ─── Filtered entries ───
  const filtered = useMemo(() => {
    if (filter === "ALL") return entries;
    return entries.filter((e) => e.type === filter);
  }, [entries, filter]);

  // ─── Tabs ───
  const tabs: TabItem[] = [
    {
      key: "ALL",
      label: "All",
      badge:
        counts.ALL > 0
          ? { label: String(counts.ALL), variant: "neutral" }
          : undefined,
    },
    {
      key: "BILL",
      label: "Bills",
      badge:
        counts.BILL > 0
          ? { label: String(counts.BILL), variant: "brand" }
          : undefined,
    },
    {
      key: "PAYMENT",
      label: "Payments",
      badge:
        counts.PAYMENT > 0
          ? { label: String(counts.PAYMENT), variant: "success" }
          : undefined,
    },
    {
      key: "LEVY",
      label: "Levies",
      badge:
        counts.LEVY > 0
          ? { label: String(counts.LEVY), variant: "warning" }
          : undefined,
    },
    {
      key: "ADJUSTMENT",
      label: "Adjustments",
      badge:
        counts.ADJUSTMENT > 0
          ? { label: String(counts.ADJUSTMENT), variant: "info" }
          : undefined,
    },
  ];

  // ─── ProTable columns ───
  const columns: ProTableColumn<PassbookEntry>[] = useMemo(
    () => [
      {
        key: "date",
        label: "Date",
        sortable: true,
        sortAccessor: (r) => new Date(r.date).getTime(),
        width: 130,
        desktop: (r) => (
          <div>
            <div className="text-body-sm text-text-primary">
              {formatDate(r.date)}
            </div>
          </div>
        ),
        mobileSecondary: (r) => formatDate(r.date),
      },
      {
        key: "type",
        label: "Type",
        sortable: true,
        sortAccessor: (r) => r.type,
        width: 120,
        desktop: (r) => <TypeBadge type={r.type} />,
        mobileBadge: (r) => <TypeBadge type={r.type} size="sm" />,
      },
      {
        key: "description",
        label: "Description",
        sortable: false,
        desktop: (r) => (
          <div className="min-w-0">
            <div className="text-text-primary truncate">{r.description}</div>
            {r.reference && (
              <div className="text-text-muted text-xs truncate">
                Ref: {r.reference}
              </div>
            )}
          </div>
        ),
        mobilePrimary: (r) => r.description,
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.amount,
        width: 140,
        desktop: (r) => <AmountCell entry={r} />,
        mobileAccent: (r) => <AmountCell entry={r} compact />,
      },
      {
        key: "balance",
        label: "Balance",
        align: "right",
        sortable: false,
        width: 120,
        desktop: (r) => (
          <span
            className={cn(
              "font-mono text-body-sm",
              r.balance === 0
                ? "text-success"
                : r.balance > 0
                  ? "text-text-secondary"
                  : "text-info",
            )}
          >
            {formatCurrency(Math.abs(r.balance))}
            {r.balance < 0 && " Cr"}
          </span>
        ),
        hideOn: ["mobile", "tablet"],
      },
    ],
    [],
  );

  // Check if villa exists (resident may not have one linked)
  const hasVilla = !!villa;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ─── Hero header ─── */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <Receipt className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-h1 text-text-primary truncate">
            {resident.name}&apos;s Ledger
          </h1>
          {hasVilla && (
            <p className="text-body-lg text-text-secondary mt-1">
              Villa {villa.villaNo} • {villa.areaInSqFt.toLocaleString("en-IN")}{" "}
              sqft
            </p>
          )}
        </div>
      </div>

      {/* ─── 3 stat cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-body-sm text-text-secondary mb-2">Monthly Due</p>
          <p
            className={cn(
              "font-mono font-bold tracking-tight",
              "text-display-2 text-gradient-brand",
            )}
          >
            {formatCurrency(summary.monthlyDue)}
          </p>

          {hasVilla && (
            <p className="text-body-sm text-text-muted mt-2">
              {villa.areaInSqFt.toLocaleString("en-IN")} sqft × ₹
              {villa.ratePerSqFt}/sqft
            </p>
          )}
        </Card>

        <Card padding="md">
          <p className="text-body-sm text-text-secondary mb-2">Total Paid</p>
          <p
            className={cn(
              "font-mono font-bold tracking-tight",
              "text-display-2 text-success",
            )}
          >
            {formatCurrency(summary.totalPaid)}
          </p>
          <p className="text-body-sm text-text-muted mt-2">
            of {formatCurrency(summary.totalDue)} due
          </p>
        </Card>

        <Card padding="md">
          <p className="text-body-sm text-text-secondary mb-2">
            Outstanding Balance
          </p>
          <p
            className={cn(
              "font-mono font-bold tracking-tight",
              "text-display-2",
              summary.outstandingBalance === 0
                ? "text-success"
                : "text-warning",
            )}
          >
            {formatCurrency(Math.abs(summary.outstandingBalance))}
          </p>

          <div className="mt-2">
            {summary.overallStatus === "PAID" ? (
              <Badge size="sm" variant="success" icon={<CheckCircle2 />}>
                Paid
              </Badge>
            ) : summary.overallStatus === "PARTIAL" ? (
              <Badge size="sm" variant="warning" icon={<AlertCircle />}>
                Partial
              </Badge>
            ) : summary.overallStatus === "CREDIT" ? (
              <Badge size="sm" variant="info" icon={<Wallet />}>
                Credit balance
              </Badge>
            ) : (
              <Badge size="sm" variant="danger" icon={<AlertCircle />}>
                Pending
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* ─── Passbook section ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-h2 text-text-primary">Passbook</h2>
          <p className="text-body-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          items={tabs}
          value={filter}
          onChange={(v) => setFilter(v as EntryFilter)}
          variant="underline"
          size="md"
        />

        {/* ProTable */}
        <ProTable<PassbookEntry>
          data={filtered}
          columns={columns}
          rowKey="id"
          search
          searchPlaceholder="Search by description, reference…"
          searchKeys={["description", "reference"]}
          defaultSort={{ key: "date", direction: "desc" }}
          density="comfortable"
          stickyHeader
          maxHeight="65vh"
          emptyTitle={
            filter === "ALL"
              ? "No entries yet"
              : `No ${filter.toLowerCase()} entries`
          }
          emptyDescription={
            filter === "ALL"
              ? "Your bills, payments, and adjustments will appear here."
              : "Try a different filter."
          }
          actions={(row) => [
            {
              label: "View details",
              icon: <FileText />,
              onClick: () => setSelectedEntry(row),
            },
          ]}
        />
      </div>

      {/* ─── Entry detail bottom sheet ─── */}
      <EntryDetailSheet
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Type Badge
// ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  BILL: { label: "Bill", variant: "brand" as const },
  PAYMENT: { label: "Payment", variant: "success" as const },
  LEVY: { label: "Levy", variant: "warning" as const },
  ADJUSTMENT: { label: "Adjustment", variant: "info" as const },
};

function TypeBadge({
  type,
  size = "md",
}: {
  type: string;
  size?: "sm" | "md";
}) {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? {
    label: type,
    variant: "neutral" as const,
  };
  return (
    <Badge size={size} variant={config.variant} outline>
      {config.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
//  Amount Cell — shows debit/credit with arrows
// ─────────────────────────────────────────────────────────────

function AmountCell({
  entry,
  compact = false,
}: {
  entry: PassbookEntry;
  compact?: boolean;
}) {
  const isCredit = entry.direction === "CREDIT";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "font-mono font-semibold whitespace-nowrap",
        compact ? "text-body-sm" : "text-body",
        isCredit ? "text-success" : "text-danger",
      )}
    >
      {isCredit ? (
        <TrendingUp className="w-3.5 h-3.5" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5" />
      )}
      {formatCurrency(entry.amount)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  Detail Bottom Sheet
// ─────────────────────────────────────────────────────────────

function EntryDetailSheet({
  entry,
  onClose,
}: {
  entry: PassbookEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  const isCredit = entry.direction === "CREDIT";

  return (
    <BottomSheet
      open={!!entry}
      onOpenChange={(open) => !open && onClose()}
      title={entry.description}
      description={formatDate(entry.date)}
    >
      <div className="space-y-4">
        {/* Big amount */}
        <div className="text-center pb-4 border-b border-border-subtle">
          <p className="text-micro uppercase tracking-wider text-text-muted">
            {isCredit ? "Credit" : "Debit"}
          </p>
          <p
            className={cn(
              "mt-2",
              "font-mono font-bold tracking-tight",
              "text-display-1",
              isCredit ? "text-success" : "text-danger",
            )}
          >
            {isCredit ? "+" : "−"}
            {formatCurrency(entry.amount)}
          </p>
        </div>

        {/* Details list */}
        <dl className="space-y-3">
          <DetailRow
            icon={<Calendar className="w-full h-full" />}
            label="Date"
            value={formatDate(entry.date)}
          />
          <DetailRow
            icon={<FileText className="w-full h-full" />}
            label="Type"
            value={<TypeBadge type={entry.type} size="sm" />}
          />
          {entry.reference && (
            <DetailRow
              icon={<Hash className="w-full h-full" />}
              label="Reference"
              value={
                <span className="font-mono text-body-sm">
                  {entry.reference}
                </span>
              }
            />
          )}
          <DetailRow
            icon={<Wallet className="w-full h-full" />}
            label="Balance after"
            value={
              <span
                className={cn(
                  "font-mono font-semibold",
                  entry.balance === 0
                    ? "text-success"
                    : entry.balance > 0
                      ? "text-text-primary"
                      : "text-info",
                )}
              >
                {formatCurrency(Math.abs(entry.balance))}
                {entry.balance < 0 && " Cr"}
              </span>
            }
          />
        </dl>
      </div>
    </BottomSheet>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
      <dt className="flex items-center gap-2 text-body-sm text-text-muted">
        <span className="w-3.5 h-3.5">{icon}</span>
        {label}
      </dt>
      <dd className="text-body text-text-primary">{value}</dd>
    </div>
  );
}
