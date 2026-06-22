"use client";

import { useState } from "react";
import { getRowKey, normalizeActions, type ProTableProps } from "./types";
import Skeleton from "../atoms/Skeleton";
import { RowDetailSheet } from "./RowDetailSheet";
import { cn } from "@/lib/utils/utils";

export function ProTableList<T>(props: ProTableProps<T>) {
  const {
    data,
    columns,
    rowKey,
    actions,
    loading = false,
    loadingRows = 6,
    density = "comfortable",
  } = props;

  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const primaryCol = columns.find((c) => c.mobilePrimary);
  const secondaryCol = columns.find((c) => c.mobileSecondary);
  const accentCol = columns.find((c) => c.mobileAccent);
  const badgeCol = columns.find((c) => c.mobileBadge);

  const rowPadding = density === "compact" ? "px-3 py-2.5" : "px-4 py-3.5";

  return (
    <>
      <ul className="divide-y divide-border-subtle">
        {loading
          ? Array.from({ length: loadingRows }).map((_, i) => (
              <li key={`skel-${i}`} className={rowPadding}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton height={14} width="40%" />
                    <Skeleton height={12} width="60%" />
                  </div>
                  <Skeleton height={20} width={60} shape="pill" />
                </div>
              </li>
            ))
          : data.map((row, rowIdx) => {
              const key = getRowKey(row, rowKey, rowIdx);
              const rowActions = normalizeActions(actions, row);

              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setSelectedRow(row)}
                    className={cn(
                      "w-full text-left",
                      rowPadding,
                      "flex items-center gap-3",
                      "hover:bg-bg-sunken/50",
                      "transition-colors duration-(--duration-fast)",
                      "focus-visible:outline-none focus-visible:bg-bg-sunken/50",
                    )}
                    aria-label={`View details${
                      rowActions.length > 0
                        ? ` and ${rowActions.length} actions`
                        : ""
                    }`}
                  >
                    {/* Primary + secondary */}
                    <div className="flex-1 min-w-0">
                      {primaryCol && (
                        <div className="text-body text-text-primary truncate">
                          {primaryCol.mobilePrimary!(row)}
                        </div>
                      )}
                      {secondaryCol && (
                        <div className="text-body-sm text-text-muted truncate mt-0.5">
                          {secondaryCol.mobileSecondary!(row)}
                        </div>
                      )}
                    </div>

                    {/* Accent + badge stack on right */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {accentCol && (
                        <div className="text-body font-medium text-text-primary">
                          {accentCol.mobileAccent!(row)}
                        </div>
                      )}
                      {badgeCol && <div>{badgeCol.mobileBadge!(row)}</div>}
                    </div>
                  </button>
                </li>
              );
            })}
      </ul>

      {/* Row detail sheet */}
      <RowDetailSheet
        row={selectedRow}
        columns={columns}
        actions={actions}
        rowKey={rowKey}
        onClose={() => setSelectedRow(null)}
      />
    </>
  );
}
