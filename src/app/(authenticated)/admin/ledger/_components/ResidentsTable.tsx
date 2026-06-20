"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  Ban,
  FileX,
} from "lucide-react";
import type { VillaRow, VillaStatus } from "@/lib/billing/getMasterLedger";

// ─── Helpers ──────────────────────────────────────────────────

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// ─── Status display config ────────────────────────────────────

const statusConfig: Record<
  VillaStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    cls: string;
  }
> = {
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  PARTIAL: {
    label: "Partial",
    icon: Clock,
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  PENDING: {
    label: "Pending",
    icon: AlertCircle,
    cls: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  CREDIT: {
    label: "Credit",
    icon: CheckCircle2,
    cls: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
  NO_BILLS: {
    label: "No bills",
    icon: FileX,
    cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
  NOT_BILLABLE: {
    label: "Not billable",
    icon: Ban,
    cls: "bg-slate-700/40 text-slate-500 border-slate-600/30",
  },
};

type Filter = "ALL" | VillaStatus;

// ─── Main component ───────────────────────────────────────────

export default function ResidentsTable({ rows }: { rows: VillaRow[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let out = rows;
    if (filter !== "ALL") out = out.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (r) =>
          (r.residentName ?? "").toLowerCase().includes(q) ||
          (r.residentEmail ?? "").toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          String(r.villaNo).includes(q),
      );
    }
    return out;
  }, [rows, filter, search]);

  const counts = useMemo(
    () => ({
      ALL: rows.length,
      PAID: rows.filter((r) => r.status === "PAID").length,
      PARTIAL: rows.filter((r) => r.status === "PARTIAL").length,
      PENDING: rows.filter((r) => r.status === "PENDING").length,
      CREDIT: rows.filter((r) => r.status === "CREDIT").length,
      NO_BILLS: rows.filter((r) => r.status === "NO_BILLS").length,
      NOT_BILLABLE: rows.filter((r) => r.status === "NOT_BILLABLE").length,
    }),
    [rows],
  );

  return (
    <section className="bg-slate-900/30 border border-slate-800/40 rounded-lg overflow-hidden">
      {/* ─── Toolbar ─── */}
      <div className="px-4 py-3 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-900/50">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            count={counts.ALL}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          <FilterChip
            label="Pending"
            count={counts.PENDING}
            active={filter === "PENDING"}
            onClick={() => setFilter("PENDING")}
            accent="red"
          />
          <FilterChip
            label="Partial"
            count={counts.PARTIAL}
            active={filter === "PARTIAL"}
            onClick={() => setFilter("PARTIAL")}
            accent="amber"
          />
          <FilterChip
            label="Paid"
            count={counts.PAID}
            active={filter === "PAID"}
            onClick={() => setFilter("PAID")}
            accent="emerald"
          />
          {counts.NOT_BILLABLE > 0 && (
            <FilterChip
              label="Not billable"
              count={counts.NOT_BILLABLE}
              active={filter === "NOT_BILLABLE"}
              onClick={() => setFilter("NOT_BILLABLE")}
            />
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, villa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-900/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Villa</th>
              <th className="text-left px-4 py-3 font-medium">
                Resident / Owner
              </th>
              <th className="text-right px-4 py-3 font-medium">Total Due</th>
              <th className="text-right px-4 py-3 font-medium">Paid</th>
              <th className="text-right px-4 py-3 font-medium">Outstanding</th>
              <th className="text-left px-4 py-3 font-medium">Last Payment</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No villas match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const cfg = statusConfig[r.status];
                const Icon = cfg.icon;
                const dim = !r.isBillable;

                return (
                  <tr
                    key={r.villaId}
                    className={`border-t border-slate-800/30 hover:bg-slate-800/30 transition-colors ${
                      dim ? "opacity-60" : ""
                    }`}
                  >
                    {/* Villa No + sqft */}
                    <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                      <div>{r.villaNo}</div>
                      <div className="text-xs text-slate-500">
                        {r.areaInSqFt} sqft
                      </div>
                    </td>

                    {/* Resident / Owner */}
                    <td className="px-4 py-3">
                      {r.isClaimed ? (
                        <>
                          <div className="text-slate-200">{r.residentName}</div>
                          <div className="text-xs text-slate-500">
                            {r.residentEmail}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-300">{r.ownerName}</div>
                          <div className="text-xs text-amber-400/70">
                            Unclaimed
                          </div>
                        </>
                      )}
                    </td>

                    {/* Total Due */}
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {inr(r.totalDue)}
                    </td>

                    {/* Paid */}
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      {inr(r.totalPaid)}
                    </td>

                    {/* Outstanding */}
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold ${
                        r.outstandingBalance > 0
                          ? "text-red-400"
                          : "text-slate-300"
                      }`}
                    >
                      {inr(Math.max(0, r.outstandingBalance))}
                    </td>

                    {/* Last Payment */}
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(r.lastPaymentDate)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cfg.cls}`}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {r.outstandingBalance > 0 && (
                          <Link
                            href={`/admin/payments/new?villa=${r.villaId}`}
                            className="p-1.5 rounded hover:bg-slate-800/60 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Record payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Link>
                        )}
                        {r.isClaimed && r.userId && (
                          <Link
                            href={`/admin/ledger/${r.userId}`}
                            className="p-1.5 rounded hover:bg-slate-800/60 text-slate-400 hover:text-violet-300 transition-colors"
                            title="View ledger"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-slate-800/40 text-xs text-slate-500 bg-slate-900/50">
        Showing {filtered.length} of {rows.length} villas
      </div>
    </section>
  );
}

// ─── Filter chip ──────────────────────────────────────────────

const chipAccents: Record<string, string> = {
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
};

function FilterChip({
  label,
  count,
  active,
  onClick,
  accent = "default",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: keyof typeof chipAccents | "default";
}) {
  const activeCls = chipAccents[accent] ?? chipAccents.default;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
        active
          ? activeCls
          : "bg-transparent text-slate-400 border-slate-700/30 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );
}
