import { cn, formatNumber } from "@/lib/utils/utils";
import { Home, Ruler, IndianRupee } from "lucide-react";

interface StatPillsProps {
  villaNo: number;
  areaInSqFt: number;
  ratePerSqFt: number;
}

interface PillData {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function StatPills({
  villaNo,
  areaInSqFt,
  ratePerSqFt,
}: StatPillsProps) {
  const pills: PillData[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "Unit",
      value: `Villa ${villaNo}`,
    },
    {
      icon: <Ruler className="w-4 h-4" />,
      label: "Carpet Area",
      value: `${formatNumber(areaInSqFt)} sqft`,
    },
    {
      icon: <IndianRupee className="w-4 h-4" />,
      label: "Rate",
      value: `₹${ratePerSqFt}/sqft`,
    },
  ];

  return (
    <div
      className={cn(
        // Mobile: horizontal scroll
        "flex gap-2 overflow-x-auto custom-scrollbar -mx-4 px-4",
        "md:overflow-visible md:mx-0 md:px-0",
        // Desktop: 3-column grid
        "md:grid md:grid-cols-3 md:gap-4",
      )}
    >
      {pills.map((pill, i) => (
        <Pill key={i} {...pill} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single pill
// ─────────────────────────────────────────────────────────────

function Pill({ icon, label, value }: PillData) {
  return (
    <div
      className={cn(
        // Base
        "shrink-0 inline-flex items-center gap-2.5",
        "px-4 py-2.5 rounded-full",
        "bg-bg-sunken border border-border-subtle",
        // Desktop: full width within grid cell, card-like
        "md:flex md:items-center md:gap-3 md:rounded-md md:p-4 md:py-4",
        "md:bg-bg-elevated md:border-border-subtle",
      )}
    >
      {/* Icon wrapper (slightly elevated on desktop) */}
      <span
        className={cn(
          "inline-flex items-center justify-center shrink-0",
          "text-text-muted",
          "md:w-9 md:h-9 md:rounded-md md:bg-bg-sunken md:text-brand-primary",
        )}
      >
        {icon}
      </span>

      {/* Label + value */}
      <div className="flex items-center gap-1.5 md:flex-col md:items-start md:gap-0.5">
        <span className="text-body-sm md:text-micro md:uppercase md:tracking-wider text-text-muted md:font-medium whitespace-nowrap">
          {label}
        </span>
        <span className="text-body-sm md:text-body md:font-semibold text-text-primary whitespace-nowrap">
          {value}
        </span>
      </div>
    </div>
  );
}
