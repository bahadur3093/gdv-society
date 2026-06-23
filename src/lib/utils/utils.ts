import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ═══════════════════════════════════════════════════════════════
//  cn — class name composition
//  Combines clsx (conditional classes) with tailwind-merge
//  (handles conflicts like "px-2 px-4" → "px-4")
// ═══════════════════════════════════════════════════════════════

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════════════════════
//  CURRENCY — Indian Rupees with Indian number formatting
//  (lakhs/crores grouping: ₹1,00,000 not ₹100,000)
// ═══════════════════════════════════════════════════════════════

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const currencyFormatterWithDecimals = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as INR currency.
 * Defaults to no decimals for cleaner display.
 *
 * @example
 *   formatCurrency(3600)        // → "₹3,600"
 *   formatCurrency(100000)      // → "₹1,00,000"
 *   formatCurrency(3600.50)     // → "₹3,601" (rounded)
 *   formatCurrency(3600.50, { decimals: true })  // → "₹3,600.50"
 */
export function formatCurrency(
  value: number | null | undefined,
  options?: { decimals?: boolean; fallback?: string },
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? "—";
  }
  const formatter = options?.decimals
    ? currencyFormatterWithDecimals
    : currencyFormatter;
  return formatter.format(value);
}

/**
 * Format currency WITHOUT the ₹ symbol (for table cells where ₹ is in header).
 *
 * @example
 *   formatCurrencyPlain(3600)  // → "3,600"
 */
export function formatCurrencyPlain(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Compact currency for charts/cards: ₹1L, ₹2.5L, ₹1.2Cr
 *
 * @example
 *   formatCurrencyCompact(150000)    // → "₹1.5L"
 *   formatCurrencyCompact(12500000)  // → "₹1.25Cr"
 */
export function formatCurrencyCompact(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 10_000_000) {
    return `${sign}₹${(abs / 10_000_000).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  }
  if (abs >= 100_000) {
    return `${sign}₹${(abs / 100_000).toFixed(2).replace(/\.?0+$/, "")}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1).replace(/\.?0+$/, "")}k`;
  }
  return `${sign}₹${abs}`;
}

// ═══════════════════════════════════════════════════════════════
//  NUMBERS
// ═══════════════════════════════════════════════════════════════

const numberFormatter = new Intl.NumberFormat("en-IN");

/**
 * Format a plain number with Indian grouping.
 *
 * @example
 *   formatNumber(12345)  // → "12,345"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return numberFormatter.format(value);
}

/**
 * Format a percentage.
 *
 * @example
 *   formatPercent(0.156)  // → "15.6%"
 *   formatPercent(20)     // → "20%" (no division)
 *   formatPercent(0.156, { decimals: 0 })  // → "16%"
 */
export function formatPercent(
  value: number | null | undefined,
  options?: { decimals?: number; alreadyPercentage?: boolean },
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const decimals = options?.decimals ?? 1;
  const num = options?.alreadyPercentage ? value : value * 100;
  return `${num.toFixed(decimals)}%`;
}

// ═══════════════════════════════════════════════════════════════
//  DATES
// ═══════════════════════════════════════════════════════════════

/**
 * Format a date in Indian format.
 *
 * @example
 *   formatDate(new Date())              // → "20 Jun 2026"
 *   formatDate(new Date(), 'short')     // → "20/06/26"
 *   formatDate(new Date(), 'long')      // → "20 June 2026"
 *   formatDate(new Date(), 'with-day')  // → "Sat, 20 Jun"
 */
export function formatDate(
  date: Date | string | null | undefined,
  variant: "default" | "short" | "long" | "with-day" = "default",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const options: Intl.DateTimeFormatOptions = (() => {
    switch (variant) {
      case "short":
        return { day: "2-digit", month: "2-digit", year: "2-digit" };
      case "long":
        return { day: "2-digit", month: "long", year: "numeric" };
      case "with-day":
        return { weekday: "short", day: "2-digit", month: "short" };
      case "default":
      default:
        return { day: "2-digit", month: "short", year: "numeric" };
    }
  })();

  return new Intl.DateTimeFormat("en-IN", options).format(d);
}

/**
 * Format date + time.
 *
 * @example
 *   formatDateTime(new Date())  // → "20 Jun 2026, 02:30 PM"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Relative time: "2 hours ago", "yesterday", "3 days ago"
 *
 * @example
 *   formatRelativeTime(twoDaysAgo)  // → "2 days ago"
 */
export function formatRelativeTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const now = Date.now();
  const diff = d.getTime() - now;
  const absDiff = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (absDiff < minute) return rtf.format(Math.round(diff / 1000), "second");
  if (absDiff < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (absDiff < day) return rtf.format(Math.round(diff / hour), "hour");
  if (absDiff < week) return rtf.format(Math.round(diff / day), "day");
  if (absDiff < month) return rtf.format(Math.round(diff / week), "week");
  return rtf.format(Math.round(diff / month), "month");
}

// ═══════════════════════════════════════════════════════════════
//  MONTH HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get month name from month number (1-12).
 *
 * @example
 *   monthName(1)            // → "January"
 *   monthName(1, 'short')   // → "Jan"
 */
export function monthName(
  month: number,
  variant: "long" | "short" = "long",
): string {
  if (month < 1 || month > 12) return "—";
  return new Date(2000, month - 1, 1).toLocaleString("en-IN", {
    month: variant,
  });
}

/**
 * "January 2026" or "Jan 2026"
 */
export function monthYear(
  month: number,
  year: number,
  variant: "long" | "short" = "long",
): string {
  return `${monthName(month, variant)} ${year}`;
}

// ═══════════════════════════════════════════════════════════════
//  STRING HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get initials from a name.
 *
 * @example
 *   getInitials("Bahadur Singh")  // → "BS"
 *   getInitials("Bahadur")        // → "B"
 *   getInitials("")               // → "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncate string with ellipsis.
 *
 * @example
 *   truncate("Long text here", 8)  // → "Long tex…"
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Format an enum value for display.
 *
 * @example
 *   humanizeEnum("LATE_FEE")       // → "Late Fee"
 *   humanizeEnum("PENDING")        // → "Pending"
 */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isActiveRoute(
  pathname: string,
  href: string,
  options: { rootHref?: string } = {},
): boolean {
  const rootHref = options.rootHref ?? "/";

  // Exact match always wins
  if (pathname === href) return true;

  // For root-level paths, only exact match counts
  if (href === rootHref) return false;

  // For nested paths, allow child routes to match
  return pathname.startsWith(href + "/");
}
