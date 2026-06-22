"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Users,
  CreditCard,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
  Ban,
  FileX,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import StatusFilters, { type FilterValue } from "./StatusFilters";
import type {
  VillaRow,
  VillaStatus,
  MasterLedgerSummary,
} from "@/lib/billing/getMasterLedger";
import Badge from "@/components/atoms/Badge";
import { cn, formatCurrency } from "@/lib/utils/utils";
import StatCard from "@/components/molecules/StatCard";

interface MasterLedgerViewProps {
  rows: VillaRow[];
  summary: MasterLedgerSummary;
  ratePerSqFt: number;
}

// ─────────────────────────────────────────────────────────────
//  Status badge config (shared between desktop + mobile renders)
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  VillaStatus,
  {
    label: string;
    variant: "success" | "warning" | "danger" | "neutral" | "brand";
    icon: React.ReactNode;
  }
> = {
  PAID: { label: "Paid", variant: "success", icon: <CheckCircle2 /> },
  PARTIAL: { label: "Partial", variant: "warning", icon: <Clock /> },
  PENDING: { label: "Pending", variant: "danger", icon: <AlertCircle /> },
  CREDIT: { label: "Credit", variant: "brand", icon: <CheckCircle2 /> },
  NO_BILLS: { label: "No bills", variant: "neutral", icon: <FileX /> },
  NOT_BILLABLE: { label: "Not billable", variant: "neutral", icon: <Ban /> },
};

function StatusBadge({
  status,
  size = "sm" as const,
}: {
  status: VillaStatus;
  size?: "sm" | "md";
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge size={size} variant={cfg.variant} icon={cfg.icon}>
      {cfg.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main view
// ─────────────────────────────────────────────────────────────

export default function MasterLedgerView({
  rows,
  summary,
  ratePerSqFt,
}: MasterLedgerViewProps) {
  const [filter, setFilter] = useState<FilterValue>("ALL");

  // ─── Filter rows by status ───
  const filteredRows = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  // ─── Compute counts per status ───
  const counts = useMemo(() => {
    const result: Record<FilterValue, number> = {
      ALL: rows.length,
      PAID: 0,
      PARTIAL: 0,
      PENDING: 0,
      CREDIT: 0,
      NO_BILLS: 0,
      NOT_BILLABLE: 0,
    };
    rows.forEach((r) => {
      result[r.status] = (result[r.status] ?? 0) + 1;
    });
    return result;
  }, [rows]);

  // ─── Column definitions for ProTable ───
  const columns: ProTableColumn<VillaRow>[] = useMemo(
    () => [
      {
        key: "villaNo",
        label: "Villa",
        sortable: true,
        width: 100,
        sortAccessor: (r) => r.villaNo,
        desktop: (r) => (
          <div>
            <div className="font-mono font-medium text-text-primary">
              {r.villaNo}
            </div>
            <div className="text-text-muted text-xs">{r.areaInSqFt} sqft</div>
          </div>
        ),
        mobilePrimary: (r) => `Villa ${r.villaNo}`,
        mobileSecondary: (r) =>
          r.isClaimed ? r.residentName : `${r.ownerName} • Unclaimed`,
      },
      {
        key: "resident",
        label: "Resident / Owner",
        sortable: true,
        sortAccessor: (r) => r.residentName ?? r.ownerName,
        desktop: (r) =>
          r.isClaimed ? (
            <div>
              <div className="text-text-primary">{r.residentName}</div>
              <div className="text-text-muted text-xs truncate max-w-50">
                {r.residentEmail}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-text-secondary">{r.ownerName}</div>
              <div className="text-warning text-xs">Unclaimed</div>
            </div>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "monthlyDue",
        label: "Monthly",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.monthlyDue,
        desktop: (r) => (
          <span className="font-mono text-text-secondary">
            {formatCurrency(r.monthlyDue)}
          </span>
        ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "totalDue",
        label: "Total Due",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.totalDue,
        desktop: (r) => (
          <span className="font-mono text-text-primary">
            {formatCurrency(r.totalDue)}
          </span>
        ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "totalPaid",
        label: "Paid",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.totalPaid,
        desktop: (r) => (
          <span className="font-mono text-success">
            {formatCurrency(r.totalPaid)}
          </span>
        ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "outstanding",
        label: "Outstanding",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.outstandingBalance,
        desktop: (r) => (
          <span
            className={cn(
              "font-mono font-semibold",
              r.outstandingBalance > 0 ? "text-danger" : "text-text-primary",
            )}
          >
            {formatCurrency(Math.max(0, r.outstandingBalance))}
          </span>
        ),
        mobileAccent: (r) => (
          <span
            className={cn(
              "font-mono font-semibold",
              r.outstandingBalance > 0 ? "text-danger" : "text-success",
            )}
          >
            {formatCurrency(Math.max(0, r.outstandingBalance))}
          </span>
        ),
      },
      {
        key: "lastPayment",
        label: "Last Payment",
        sortable: true,
        sortAccessor: (r) =>
          r.lastPaymentDate ? new Date(r.lastPaymentDate).getTime() : 0,
        desktop: (r) =>
          r.lastPaymentDate ? (
            <span className="text-text-secondary">
              {new Date(r.lastPaymentDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-text-muted">—</span>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        sortAccessor: (r) => r.status,
        desktop: (r) => <StatusBadge status={r.status} />,
        mobileBadge: (r) => <StatusBadge status={r.status} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Billed"
          value={summary.totalDueAcrossAll}
          format="currency-compact"
          description={`Across ${summary.villasWithBills} villas`}
          icon={<Wallet />}
          accent="brand"
        />
        <StatCard
          label="Collected"
          value={summary.totalCollectedAcrossAll}
          format="currency-compact"
          description={`${summary.fullyPaidCount} fully paid`}
          icon={<CheckCircle2 />}
          accent="success"
        />
        <StatCard
          label="Outstanding"
          value={summary.totalOutstandingAcrossAll}
          format="currency-compact"
          description={`${summary.defaultersCount} defaulters`}
          icon={<AlertTriangle />}
          accent="warning"
        />
        <StatCard
          label="Villas"
          value={`${summary.billableVillas}`}
          description={`${summary.claimedVillas} claimed of ${summary.totalVillas}`}
          icon={<Users />}
          accent="info"
        />
      </div>

      {/* ─── ProTable with status filters ─── */}
      <ProTable<VillaRow>
        data={filteredRows}
        columns={columns}
        rowKey="villaId"
        title="Villa Overview"
        description={
          filter === "ALL"
            ? "All villas in the society"
            : `Filtered to ${STATUS_CONFIG[filter as VillaStatus]?.label.toLowerCase() ?? filter.toLowerCase()}`
        }
        search
        searchPlaceholder="Search by villa, name, or email..."
        searchKeys={["villaNo", "residentName", "residentEmail", "ownerName"]}
        defaultSort={{ key: "outstanding", direction: "desc" }}
        filters={
          <StatusFilters value={filter} onChange={setFilter} counts={counts} />
        }
        stickyHeader
        stickyActions
        showDensityToggle
        maxHeight="70vh"
        density="comfortable"
        emptyTitle="No villas match this filter"
        emptyDescription="Try a different status filter or clear the search"
        actions={(row) => {
          const actions: Array<{
            label: string;
            icon: React.ReactNode;
            href?: (r: VillaRow) => string;
            show?: (r: VillaRow) => boolean;
          }> = [];

          // Record Payment — only for villas with outstanding
          if (row.outstandingBalance > 0) {
            actions.push({
              label: "Record Payment",
              icon: <CreditCard />,
              href: (r) => `/admin/payments/new?villa=${r.villaId}`,
            });
          }

          // View Ledger — only for claimed villas
          if (row.isClaimed && row.userId) {
            actions.push({
              label: "View Ledger",
              icon: <Eye />,
              href: (r) => `/admin/ledger/${r.userId}`,
            });
          }

          return actions;
        }}
      />
    </div>
  );
}
