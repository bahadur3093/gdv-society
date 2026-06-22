import type { ReactNode } from "react";

export interface ProTableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
  hideOn?: ("desktop" | "tablet" | "mobile")[];
  desktop: (row: T) => ReactNode;
  mobilePrimary?: (row: T) => ReactNode;
  mobileSecondary?: (row: T) => ReactNode;
  mobileAccent?: (row: T) => ReactNode;
  mobileBadge?: (row: T) => ReactNode;
}

export interface ProTableAction<T> {
  label: string;
  icon?: ReactNode;
  onClick?: (row: T) => void;
  href?: (row: T) => string;
  variant?: "default" | "danger";
  show?: (row: T) => boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export type ProTableDensity = "compact" | "comfortable";
export type ProTableMobileMode = "list" | "cards";

export interface ProTableProps<T> {
  data: T[];
  columns: ProTableColumn<T>[];
  rowKey: keyof T | ((row: T, index: number) => string);
  actions?: ProTableAction<T>[] | ((row: T) => ProTableAction<T>[]);
  filters?: ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  searchPredicate?: (row: T, query: string) => boolean;
  defaultSort?: { key: string; direction: SortDirection };
  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  density?: ProTableDensity;
  mobileMode?: ProTableMobileMode;
  className?: string;
  stickyHeader?: boolean;
  stickyActions?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  toolbarActions?: ReactNode;
  maxHeight?: string | number;
  rowDividers?: boolean;
  showDensityToggle?: boolean;
}

export function getRowKey<T>(
  row: T,
  rowKey: ProTableProps<T>["rowKey"],
  index = 0,
): string {
  if (typeof rowKey === "function") return rowKey(row, index);
  const value = row[rowKey];
  return typeof value === "string" ? value : String(value);
}

export function normalizeActions<T>(
  actions: ProTableProps<T>["actions"],
  row: T,
): ProTableAction<T>[] {
  if (!actions) return [];
  const list = typeof actions === "function" ? actions(row) : actions;
  return list.filter((a) => !a.show || a.show(row));
}
