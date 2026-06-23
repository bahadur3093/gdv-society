import { TrendingUp, TrendingDown, Minus, Wallet } from "lucide-react";
import type { ResidentExpensesData } from "@/lib/expenses/getExpenses";
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
  thisMonth: ResidentExpensesData["thisMonth"];
  lastMonth: ResidentExpensesData["lastMonth"];
}

export default function ExpensesHeroCard({ thisMonth, lastMonth }: Props) {
  // Compute delta (% change vs last month)
  const delta =
    lastMonth.total > 0
      ? ((thisMonth.total - lastMonth.total) / lastMonth.total) * 100
      : 0;

  const trend: "up" | "down" | "flat" =
    Math.abs(delta) < 1 ? "flat" : delta > 0 ? "up" : "down";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-danger"
      : trend === "down"
        ? "text-success"
        : "text-text-muted";

  return (
    <Card variant="gradient" padding="lg" className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-md bg-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
              Spent in {MONTHS[thisMonth.month - 1]} {thisMonth.year}
            </p>
            <p
              className={cn(
                "mt-2",
                "font-mono font-bold tracking-tight",
                "text-display-1 md:text-[64px] md:leading-16",
                "text-gradient-brand",
              )}
            >
              {formatCurrency(thisMonth.total)}
            </p>
          </div>
        </div>

        {/* Delta vs last month */}
        {lastMonth.total > 0 && (
          <div
            className={cn(
              "inline-flex items-center gap-2",
              "px-3 py-1.5 rounded-full",
              "bg-bg-sunken/50 backdrop-blur-sm border border-border-subtle",
            )}
          >
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
            <span className={cn("text-body-sm font-medium", trendColor)}>
              {trend === "flat"
                ? "Same as last month"
                : `${trend === "up" ? "+" : ""}${delta.toFixed(1)}% vs ${MONTHS[lastMonth.month - 1]}`}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
