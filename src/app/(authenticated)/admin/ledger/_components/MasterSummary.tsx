import { Wallet, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import type { MasterLedgerSummary } from "@/lib/billing/getMasterLedger";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function MasterSummary({
  summary,
}: {
  summary: MasterLedgerSummary;
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={Wallet}
        label="Total Billed"
        value={inr(summary.totalDueAcrossAll)}
        sub={`Across ${summary.villasWithBills} villas`}
        accent="violet"
      />
      <Card
        icon={CheckCircle2}
        label="Collected"
        value={inr(summary.totalCollectedAcrossAll)}
        sub={`${summary.fullyPaidCount} fully paid`}
        accent="emerald"
      />
      <Card
        icon={AlertTriangle}
        label="Outstanding"
        value={inr(summary.totalOutstandingAcrossAll)}
        sub={`${summary.defaultersCount} defaulters`}
        accent="amber"
      />
      <Card
        icon={Users}
        label="Villas"
        value={`${summary.billableVillas} billable`}
        sub={`${summary.claimedVillas} claimed of ${summary.totalVillas} total`}
        accent="blue"
      />
    </section>
  );
}

// ─── Reusable card ─────────────────────────────────────────────

const accents = {
  violet: "text-violet-400 bg-violet-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  red: "text-red-400 bg-red-500/10",
  blue: "text-blue-400 bg-blue-500/10",
};

function Card({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent: keyof typeof accents;
}) {
  return (
    <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {value}
          </p>
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
        <div className={`p-2 rounded-lg ${accents[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
