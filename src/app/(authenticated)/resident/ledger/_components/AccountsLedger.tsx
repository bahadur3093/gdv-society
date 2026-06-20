import { Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import type { ResidentLedger, PassbookEntry } from '@/lib/billing/getResidentLedger';

interface Props {
  data: ResidentLedger;
  showHeader?: boolean;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function AccountsLedger({ data, showHeader = true }: Props) {
  const { resident, villa, summary, entries } = data;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              {resident.name}`&lsquo;`s Ledger
            </h1>
            <p className="text-slate-400">
              {villa
                ? `Villa ${villa.villaNo} • ${villa.areaInSqFt} sqft`
                : 'No villa linked yet'}
            </p>
          </div>
        </div>
      )}

      <SummaryCards summary={summary} villa={villa} />
      <LedgerTable entries={entries} />
    </div>
  );
}

// ─── Summary Cards (same as before) ──────────────────────────

function SummaryCards({
  summary,
  villa,
}: {
  summary: ResidentLedger['summary'];
  villa: ResidentLedger['villa'];
}) {
  const statusColors = {
    PAID: 'text-emerald-400',
    PARTIAL: 'text-amber-400',
    PENDING: 'text-red-400',
    CREDIT: 'text-violet-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <p className="text-sm text-slate-400 mb-2">Monthly Due</p>
        <p className="text-2xl font-bold font-mono text-violet-400">
          {formatCurrency(summary.monthlyDue)}
        </p>
        {villa && (
          <p className="text-xs text-slate-500 mt-2">
            {villa.areaInSqFt} sqft × ₹{villa.ratePerSqFt}/sqft
          </p>
        )}
      </div>

      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <p className="text-sm text-slate-400 mb-2">Total Paid</p>
        <p className="text-2xl font-bold font-mono text-emerald-400">
          {formatCurrency(summary.totalPaid)}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          of {formatCurrency(summary.totalDue)} due
        </p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <p className="text-sm text-slate-400 mb-2">Outstanding Balance</p>
        <p className={`text-2xl font-bold font-mono ${statusColors[summary.overallStatus]}`}>
          {formatCurrency(Math.abs(summary.outstandingBalance))}
        </p>
        <span
          className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold ${statusColors[summary.overallStatus]} bg-slate-800/60`}
        >
          {summary.overallStatus}
        </span>
      </div>
    </div>
  );
}

// ─── Ledger Table (same as before) ───────────────────────────

function LedgerTable({ entries }: { entries: PassbookEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-12 text-center">
        <Receipt className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">Passbook</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/40">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Description</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Debit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Credit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <LedgerRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const typeBadges: Record<PassbookEntry['type'], { label: string; cls: string }> = {
  BILL:       { label: 'Bill',       cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  PAYMENT:    { label: 'Payment',    cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  LEVY:       { label: 'Levy',       cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  ADJUSTMENT: { label: 'Adjustment', cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
};

function LedgerRow({ entry }: { entry: PassbookEntry }) {
  const badge = typeBadges[entry.type];

  return (
    <tr className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap">
        {formatDate(entry.date)}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${badge.cls}`}>
          {badge.label}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-300">
        <div>{entry.description}</div>
        {entry.reference && (
          <div className="text-xs text-slate-500 mt-0.5">Ref: {entry.reference}</div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right font-mono">
        {entry.direction === 'DEBIT' ? (
          <span className="text-red-400 flex items-center justify-end gap-1">
            <TrendingDown className="w-3 h-3" />
            {formatCurrency(entry.amount)}
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right font-mono">
        {entry.direction === 'CREDIT' ? (
          <span className="text-green-400 flex items-center justify-end gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatCurrency(entry.amount)}
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-violet-400 whitespace-nowrap">
        {formatCurrency(entry.balance)}
      </td>
    </tr>
  );
}