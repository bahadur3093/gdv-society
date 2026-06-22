"use client";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  formatCurrencyCompact,
  formatRelativeTime,
  monthYear,
  getInitials,
} from "@/lib/utils/utils";
import { cn, formatCurrency, formatDate } from "@/utils";
import Link from "next/link";

export default function ThemeTest() {
  const { preference, resolved, setPreference, toggle } = useTheme();

  return (
    <div className="p-6 bg-bg-elevated rounded-md border border-border-subtle space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setPreference("light")}
          className="px-3 h-10 rounded bg-bg-sunken text-text-primary border border-border-default text-body-sm"
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setPreference("dark")}
          className="px-3 h-10 rounded bg-bg-sunken text-text-primary border border-border-default text-body-sm"
        >
          🌙 Dark
        </button>
        <button
          onClick={() => setPreference("system")}
          className="px-3 h-10 rounded bg-bg-sunken text-text-primary border border-border-default text-body-sm"
        >
          🖥️ System
        </button>
        <button
          onClick={toggle}
          className="px-3 h-10 rounded bg-brand-primary text-brand-primary-fg text-body-sm"
        >
          Quick Toggle
        </button>
      </div>

      <div className="p-6 space-y-4 max-w-2xl">
        <h2 className="text-h2 text-text-primary">Utils Sanity Check</h2>

        <pre className="text-body-sm text-text-secondary font-mono whitespace-pre-wrap bg-bg-sunken p-4 rounded">
          {`formatCurrency(3600)           → ${formatCurrency(3600)}
formatCurrency(150000)         → ${formatCurrency(150000)}
formatCurrencyCompact(150000)  → ${formatCurrencyCompact(150000)}
formatCurrencyCompact(2500000) → ${formatCurrencyCompact(2500000)}
formatDate(new Date())         → ${formatDate(new Date())}
formatDate(new Date(), 'long') → ${formatDate(new Date())}
// formatRelativeTime(yesterday)  → ${formatRelativeTime(new Date(Date.now() - 86400000))}
monthYear(6, 2026)             → ${monthYear(6, 2026)}
getInitials("Bahadur Singh")   → ${getInitials("Bahadur Singh")}
`}
        </pre>

        {/* Test cn() merge */}
        <div
          className={cn(
            "p-4 rounded bg-bg-elevated border border-border-subtle",
            "text-text-primary",
            false && "hidden", // conditional: stays visible
            "p-6", // overrides p-4 (twMerge magic)
          )}
        >
          cn() works: should have p-6 padding (not p-4)
        </div>
      </div>
    </div>
  );
}
