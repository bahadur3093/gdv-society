import { History } from "lucide-react";

interface Group {
  month: number;
  year: number;
  count: number;
  total: number;
  latest: Date;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const monthName = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "long" });

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function RecentGenerations({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return null;

  return (
    <section className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-100">
          Recent Generations
        </h2>
      </div>

      <div className="space-y-2">
        {groups.map((g) => (
          <div
            key={`${g.year}-${g.month}`}
            className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-800/30"
          >
            <div>
              <p className="text-slate-200 font-medium">
                {monthName(g.month)} {g.year}
              </p>
              <p className="text-xs text-slate-500">
                {g.count} bills • Generated {formatDate(g.latest)}
              </p>
            </div>
            <p className="text-sm font-mono text-emerald-300">{inr(g.total)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
