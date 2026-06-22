"use client";

import type { VillaStatus } from "@/lib/billing/getMasterLedger";
import { cn } from "@/lib/utils/utils";

export type FilterValue = "ALL" | VillaStatus;

interface StatusFiltersProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: Record<FilterValue, number>;
}

interface FilterOption {
  value: FilterValue;
  label: string;
  accent: "neutral" | "red" | "amber" | "emerald";
}

const FILTERS: FilterOption[] = [
  { value: "ALL", label: "All", accent: "neutral" },
  { value: "PENDING", label: "Pending", accent: "red" },
  { value: "PARTIAL", label: "Partial", accent: "amber" },
  { value: "PAID", label: "Paid", accent: "emerald" },
  { value: "NOT_BILLABLE", label: "Not billable", accent: "neutral" },
];

const accentClasses = {
  neutral:
    "data-[active=true]:bg-bg-sunken data-[active=true]:text-text-primary data-[active=true]:border-border-strong",
  red: "data-[active=true]:bg-danger-muted data-[active=true]:text-danger data-[active=true]:border-danger-border",
  amber:
    "data-[active=true]:bg-warning-muted data-[active=true]:text-warning data-[active=true]:border-warning-border",
  emerald:
    "data-[active=true]:bg-success-muted data-[active=true]:text-success data-[active=true]:border-success-border",
};

export default function StatusFilters({
  value,
  onChange,
  counts,
}: StatusFiltersProps) {
  return (
    <div
      className={cn(
        // Mobile: horizontal scroll
        "flex gap-1.5 overflow-x-auto custom-scrollbar -mx-1 px-1 py-0.5",
        "md:overflow-visible md:flex-wrap",
      )}
    >
      {FILTERS.map((filter) => {
        const count = counts[filter.value] ?? 0;
        const isActive = value === filter.value;

        // Skip filter if count is zero (except All)
        if (count === 0 && filter.value !== "ALL") return null;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            data-active={isActive}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5",
              "px-3 py-1.5 rounded-full",
              "text-body-sm font-medium",
              "border",
              "transition-colors duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary focus-visible:ring-offset-1",
              "focus-visible:ring-offset-bg-base",
              // Default (inactive) state
              "bg-transparent text-text-secondary border-border-default",
              "hover:bg-bg-sunken hover:text-text-primary",
              // Active state via data attribute
              accentClasses[filter.accent],
            )}
          >
            <span>{filter.label}</span>
            <span
              className={cn(
                "text-micro font-medium px-1.5 rounded",
                "bg-bg-sunken text-text-muted",
                "group-data-[active=true]:bg-current/10",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
