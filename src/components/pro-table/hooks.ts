"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { ProTableColumn, SortState, SortDirection } from "./types";

// ─────────────────────────────────────────────────────────────
//  useViewport — returns 'desktop' | 'tablet' | 'mobile'
// ─────────────────────────────────────────────────────────────

export type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_BREAKPOINTS = {
  mobile: "(max-width: 479px)",
  tablet: "(min-width: 480px) and (max-width: 767px)",
  // desktop = everything else
};

function subscribeToViewport(callback: () => void): () => void {
  const mq1 = window.matchMedia(VIEWPORT_BREAKPOINTS.mobile);
  const mq2 = window.matchMedia(VIEWPORT_BREAKPOINTS.tablet);
  mq1.addEventListener("change", callback);
  mq2.addEventListener("change", callback);
  return () => {
    mq1.removeEventListener("change", callback);
    mq2.removeEventListener("change", callback);
  };
}

function getViewport(): Viewport {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(VIEWPORT_BREAKPOINTS.mobile).matches) return "mobile";
  if (window.matchMedia(VIEWPORT_BREAKPOINTS.tablet).matches) return "tablet";
  return "desktop";
}

function getServerViewport(): Viewport {
  return "desktop"; // SSR-safe default
}

export function useViewport(): Viewport {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewport,
    getServerViewport,
  );
}

// ─────────────────────────────────────────────────────────────
//  useSortedData — applies sort to data array
// ─────────────────────────────────────────────────────────────

export function useSortedData<T>(
  data: T[],
  columns: ProTableColumn<T>[],
  defaultSort?: { key: string; direction: SortDirection },
) {
  const [sortState, setSortState] = useState<SortState>({
    key: defaultSort?.key ?? null,
    direction: defaultSort?.direction ?? "asc",
  });

  const sortedData = useMemo(() => {
    if (!sortState.key) return data;

    const column = columns.find((c) => c.key === sortState.key);
    if (!column || !column.sortable) return data;

    const accessor =
      column.sortAccessor ??
      ((row: T) => (row as Record<string, unknown>)[column.key]);

    const sorted = [...data].sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);

      // Nulls go last regardless of direction
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [data, columns, sortState]);

  const toggleSort = (key: string) => {
    setSortState((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" }; // Third click clears
    });
  };

  return { sortedData, sortState, toggleSort };
}

// ─────────────────────────────────────────────────────────────
//  useSearchedData — filters data by search query
// ─────────────────────────────────────────────────────────────

export function useSearchedData<T>(
  data: T[],
  query: string,
  options: {
    searchKeys?: (keyof T)[];
    searchPredicate?: (row: T, query: string) => boolean;
  } = {},
) {
  return useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return data;

    if (options.searchPredicate) {
      return data.filter((row) => options.searchPredicate!(row, trimmed));
    }

    if (!options.searchKeys || options.searchKeys.length === 0) {
      // Default: search all string properties
      return data.filter((row) => {
        return Object.values(row as Record<string, unknown>).some((val) => {
          if (typeof val === "string" || typeof val === "number") {
            return String(val).toLowerCase().includes(trimmed);
          }
          return false;
        });
      });
    }

    return data.filter((row) => {
      return options.searchKeys!.some((key) => {
        const val = row[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(trimmed);
      });
    });
  }, [data, query, options.searchKeys, options.searchPredicate]);
}
