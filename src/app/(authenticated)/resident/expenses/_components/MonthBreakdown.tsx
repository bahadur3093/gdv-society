import { PieChart } from "lucide-react";
import { getCategoryConfig } from "@/lib/expenses/categories";
import type { ResidentExpensesData } from "@/lib/expenses/getExpenses";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import { cn, formatCurrency } from "@/lib/utils/utils";

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

interface Props {
  month: number;
  year: number;
  total: number;
  breakdown: ResidentExpensesData["thisMonth"]["byCategory"];
}

export default function MonthBreakdown({
  month,
  year,
  total,
  breakdown,
}: Props) {
  return (
    <Section
      title="Where it went"
      description={`Breakdown for ${MONTHS[month - 1]} ${year}`}
      icon={<PieChart />}
    >
      <Card padding="md">
        <ul className="space-y-4">
          {breakdown.map((item) => (
            <CategoryBar
              key={item.category}
              category={item.category}
              amount={item.amount}
              percentage={item.percentage}
            />
          ))}
        </ul>

        {/* Total footer */}
        <div className="mt-5 pt-4 border-t border-border-default flex items-center justify-between">
          <span className="text-body font-medium text-text-primary">
            Total spent
          </span>
          <span className="font-mono font-bold text-h4 text-text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </Card>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single category bar
// ─────────────────────────────────────────────────────────────

interface CategoryBarProps {
  category: string;
  amount: number;
  percentage: number;
}

function CategoryBar({ category, amount, percentage }: CategoryBarProps) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  // Map accent → bar fill color (Tailwind class)
  const barColorMap: Record<typeof config.accent, string> = {
    amber: "bg-amber-500",
    sky: "bg-sky-500",
    red: "bg-red-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    orange: "bg-orange-500",
    brand: "bg-brand-primary",
    neutral: "bg-text-secondary",
  };

  const iconColorMap: Record<typeof config.accent, string> = {
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
    <li>
      {/* Top row: icon + label + amount */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
            iconColorMap[config.accent],
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-text-primary">{category}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono font-semibold text-body text-text-primary">
            {formatCurrency(amount)}
          </p>
          <p className="text-body-sm text-text-muted">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ml-11 h-2 bg-bg-sunken rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-[var(--duration-slow)]",
            barColorMap[config.accent],
          )}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </li>
  );
}
