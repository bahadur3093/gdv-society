import {
  Zap,
  Droplets,
  Shield,
  Trees,
  SprayCan,
  Wrench,
  Recycle,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface ExpenseCategoryConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Tailwind color tokens for visual differentiation */
  accent:
    | "amber"
    | "sky"
    | "red"
    | "emerald"
    | "violet"
    | "orange"
    | "brand"
    | "neutral";
}

/**
 * Predefined expense categories.
 * "Misc" catches everything else — admin uses description field for specifics.
 *
 * Values are STORED in DB — changing labels here doesn't affect data.
 */
export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    value: "Electricity",
    label: "Electricity",
    icon: Zap,
    accent: "amber",
  },
  {
    value: "Water",
    label: "Water",
    icon: Droplets,
    accent: "sky",
  },
  {
    value: "Security",
    label: "Security",
    icon: Shield,
    accent: "red",
  },
  {
    value: "Gardening",
    label: "Gardening",
    icon: Trees,
    accent: "emerald",
  },
  {
    value: "Cleaning",
    label: "Cleaning",
    icon: SprayCan,
    accent: "violet",
  },
  {
    value: "Maintenance",
    label: "Maintenance",
    icon: Wrench,
    accent: "brand",
  },
  {
    value: "STP/Sewage",
    label: "STP/Sewage",
    icon: Recycle,
    accent: "orange",
  },
  {
    value: "Misc",
    label: "Misc",
    icon: MoreHorizontal,
    accent: "neutral",
  },
];

/**
 * Quick lookup by category value.
 */
export function getCategoryConfig(value: string): ExpenseCategoryConfig {
  return (
    EXPENSE_CATEGORIES.find((c) => c.value === value) ?? {
      value,
      label: value,
      icon: MoreHorizontal,
      accent: "neutral",
    }
  );
}

/**
 * Returns true if the category value is one of the predefined ones.
 */
export function isValidCategory(value: string): boolean {
  return EXPENSE_CATEGORIES.some((c) => c.value === value);
}
