// components/pro-table/ProTableDesktop.tsx
"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  getRowKey,
  normalizeActions,
  type ProTableProps,
  type SortState,
  type ProTableAction,
} from "./types";
import { cn } from "@/lib/utils/utils";
import Skeleton from "../atoms/Skeleton";
import IconButton from "../atoms/IconButton";

interface ProTableDesktopProps<T> extends ProTableProps<T> {
  sortState: SortState;
  onSort: (key: string) => void;
}

export function ProTableDesktop<T>(props: ProTableDesktopProps<T>) {
  const {
    data,
    columns,
    rowKey,
    actions,
    sortState,
    onSort,
    loading = false,
    loadingRows = 8,
    density = "comfortable",
    // New props
    stickyHeader = false,
    stickyActions = false,
    maxHeight,
    rowDividers = true,
  } = props;

  // Filter columns hidden on desktop
  const visibleColumns = columns.filter((c) => !c.hideOn?.includes("desktop"));

  const cellPadding = density === "compact" ? "px-3 py-2" : "px-4 py-3.5";
  const headerPadding = density === "compact" ? "px-3 py-2" : "px-4 py-2.5";

  // Container style for maxHeight (enables internal scroll for sticky header)
  const containerStyle: React.CSSProperties = {};
  if (maxHeight !== undefined) {
    containerStyle.maxHeight =
      typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
  }

  return (
    <div
      className={cn(
        "overflow-auto custom-scrollbar",
        // When sticky header, container needs relative positioning
        stickyHeader && "relative",
      )}
      style={containerStyle}
    >
      <table className="w-full text-body-sm border-collapse">
        {/* ─── Header ─── */}
        <thead
          className={cn(
            "bg-bg-sunken/50",
            // Sticky positioning
            stickyHeader && "sticky top-0 z-10",
            // Border bottom only (subtle line between header and body)
            "shadow-[inset_0_-1px_0_0] shadow-border-subtle",
          )}
        >
          <tr>
            {visibleColumns.map((col) => {
              const isSorted = sortState.key === col.key;
              const SortIcon = !isSorted
                ? ArrowUpDown
                : sortState.direction === "asc"
                  ? ArrowUp
                  : ArrowDown;

              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    headerPadding,
                    "text-micro uppercase tracking-wider font-medium",
                    "text-text-muted whitespace-nowrap",
                    // Match header bg (important for sticky to look right)
                    "bg-bg-sunken/50",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.align !== "right" &&
                      col.align !== "center" &&
                      "text-left",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "hover:text-text-primary",
                        "transition-colors duration-(--duration-fast)",
                        "focus-visible:outline-none focus-visible:underline",
                        col.align === "right" && "flex-row-reverse",
                        isSorted && "text-text-primary",
                      )}
                    >
                      <span>{col.label}</span>
                      <SortIcon
                        className={cn(
                          "w-3 h-3 shrink-0",
                          isSorted ? "opacity-100" : "opacity-50",
                        )}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
            {actions && (
              <th
                scope="col"
                className={cn(
                  headerPadding,
                  "w-10 text-right",
                  "bg-bg-sunken/50",
                  // Sticky right edge during horizontal scroll
                  stickyActions && [
                    "sticky right-0 z-10",
                    "shadow-[-4px_0_8px_-4px] shadow-black/10",
                  ],
                )}
              >
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>

        {/* ─── Body ─── */}
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }).map((_, i) => (
                <tr
                  key={`skel-${i}`}
                  className={cn(rowDividers && "border-b border-border-subtle")}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={cellPadding}>
                      <Skeleton height={16} width="60%" />
                    </td>
                  ))}
                  {actions && (
                    <td
                      className={cn(
                        cellPadding,
                        stickyActions && [
                          "sticky right-0",
                          "bg-bg-elevated",
                          "shadow-[-4px_0_8px_-4px] shadow-black/10",
                        ],
                      )}
                    >
                      <Skeleton height={24} width={24} shape="circle" />
                    </td>
                  )}
                </tr>
              ))
            : data.map((row, rowIdx) => {
                const key = getRowKey(row, rowKey, rowIdx);
                const rowActions = normalizeActions(actions, row);

                return (
                  <tr
                    key={key}
                    className={cn(
                      "group",
                      rowDividers &&
                        "border-b border-border-subtle last:border-b-0",
                      "transition-colors duration-(--duration-fast)",
                      "hover:bg-bg-sunken/30",
                    )}
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          cellPadding,
                          "text-text-primary align-middle",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                        )}
                      >
                        {col.desktop(row)}
                      </td>
                    ))}
                    {actions && (
                      <td
                        className={cn(
                          cellPadding,
                          "text-right whitespace-nowrap",
                          stickyActions && [
                            "sticky right-0",
                            "bg-bg-elevated",
                            "group-hover:bg-[color-mix(in_srgb,var(--color-bg-elevated)_70%,var(--color-bg-sunken)_30%)]",
                            "shadow-[-4px_0_8px_-4px] shadow-black/10",
                          ],
                        )}
                      >
                        <RowActions actions={rowActions} row={row} />
                      </td>
                    )}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Row actions — renders inline icon buttons
// ─────────────────────────────────────────────────────────────

function RowActions<T>({
  actions,
  row,
}: {
  actions: ProTableAction<T>[];
  row: T;
}) {
  if (actions.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-1">
      {actions.map((action, i) => {
        const href = action.href?.(row);

        if (href) {
          return (
            <IconButton
              key={`${action.label}-${i}`}
              asChild
              label={action.label}
              icon={action.icon ?? <span aria-hidden>•</span>}
              size="sm"
              variant={action.variant === "danger" ? "danger" : "ghost"}
              showTooltip
            >
              <Link href={href}>{action.label}</Link>
            </IconButton>
          );
        }

        return (
          <IconButton
            key={`${action.label}-${i}`}
            label={action.label}
            icon={action.icon ?? <span aria-hidden>•</span>}
            size="sm"
            variant={action.variant === "danger" ? "danger" : "ghost"}
            onClick={() => action.onClick?.(row)}
            showTooltip
          />
        );
      })}
    </div>
  );
}
