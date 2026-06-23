import { BarChart3 } from "lucide-react";
import type { ResidentExpensesData } from "@/lib/expenses/getExpenses";
import Section from "@/components/organisms/Section";
import { cn, formatCurrency } from "@/lib/utils/utils";
import Card from "@/components/atoms/Card";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Props {
  months: ResidentExpensesData["recentMonths"];
}

export default function SixMonthTrend({ months }: Props) {
  // Sort oldest to newest for left-to-right bar display
  const sorted = [...months].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Find max for bar scaling
  const maxTotal = Math.max(...sorted.map((m) => m.total), 1);

  // Identify current month for highlighting
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Compute trend (compare last to first month)
  const avg = sorted.reduce((s, m) => s + m.total, 0) / sorted.length;

  return (
    <Section
      title="Recent trend"
      description={`Last ${sorted.length} months · Avg ${formatCurrency(avg)}`}
      icon={<BarChart3 />}
    >
      <Card padding="md">
        <div className="flex items-end justify-between gap-2 md:gap-4 h-48">
          {sorted.map((m) => {
            const isCurrent =
              m.month === currentMonth && m.year === currentYear;
            const heightPct = (m.total / maxTotal) * 100;

            return (
              <BarColumn
                key={`${m.year}-${m.month}`}
                month={m.month}
                year={m.year}
                total={m.total}
                heightPct={heightPct}
                isCurrent={isCurrent}
              />
            );
          })}
        </div>
      </Card>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single bar column
// ─────────────────────────────────────────────────────────────

interface BarColumnProps {
  month: number;
  year: number;
  total: number;
  heightPct: number;
  isCurrent: boolean;
}

function BarColumn({
  month,
  year,
  total,
  heightPct,
  isCurrent,
}: BarColumnProps) {
  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      {/* Amount above bar (smaller text) */}
      <p className="text-body-sm font-mono font-medium text-text-primary mb-1.5 whitespace-nowrap">
        {formatCompactCurrency(total)}
      </p>

      {/* Bar container — fills remaining height */}
      <div className="flex-1 w-full flex items-end relative">
        <div
          className={cn(
            "w-full rounded-t-md transition-all duration-(--duration-slow)",
            isCurrent
              ? "bg-linear-to-t from-brand-primary to-brand-pink"
              : "bg-bg-sunken border-t border-border-default",
          )}
          style={{
            height: `${Math.max(heightPct, 4)}%`,
            minHeight: "8px",
          }}
        />
      </div>

      {/* Month label */}
      <p
        className={cn(
          "text-micro uppercase tracking-wider mt-2",
          isCurrent
            ? "text-brand-primary font-bold"
            : "text-text-muted font-medium",
        )}
      >
        {MONTHS_SHORT[month - 1]}
      </p>
      <p
        className={cn(
          "text-micro",
          isCurrent ? "text-brand-primary" : "text-text-muted",
        )}
      >
        &apos;{String(year).slice(-2)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Compact currency formatter for bar labels
//  (₹1.5L, ₹25k — saves space above bars)
// ─────────────────────────────────────────────────────────────

function formatCompactCurrency(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
