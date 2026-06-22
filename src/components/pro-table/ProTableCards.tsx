"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { getRowKey, type ProTableProps } from "./types";
import Skeleton from "../atoms/Skeleton";
import { cn } from "@/lib/utils/utils";
import { RowDetailSheet } from "./RowDetailSheet";

export function ProTableCards<T>(props: ProTableProps<T>) {
  const {
    data,
    columns,
    rowKey,
    actions,
    loading = false,
    loadingRows = 4,
  } = props;

  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const primaryCol = columns.find((c) => c.mobilePrimary);
  const secondaryCol = columns.find((c) => c.mobileSecondary);
  const accentCol = columns.find((c) => c.mobileAccent);
  const badgeCol = columns.find((c) => c.mobileBadge);

  return (
    <>
      <div className="space-y-2 p-3">
        {loading
          ? Array.from({ length: loadingRows }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="p-4 rounded-md border border-border-subtle bg-bg-elevated space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton height={16} width="40%" />
                    <Skeleton height={12} width="70%" />
                  </div>
                  <Skeleton height={20} width={60} shape="pill" />
                </div>
                <Skeleton height={20} width={100} />
              </div>
            ))
          : data.map((row, rowIdx) => {
              const key = getRowKey(row, rowKey, rowIdx);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRow(row)}
                  className={cn(
                    "w-full text-left",
                    "p-4 rounded-md",
                    "bg-bg-elevated border border-border-subtle",
                    "hover:border-border-default hover:shadow-sm",
                    "active:scale-[0.99]",
                    "transition-all duration-(--duration-fast)",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-bg-base",
                  )}
                >
                  {/* Top row: primary + badge */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex-1 min-w-0">
                      {primaryCol && (
                        <div className="text-h4 text-text-primary truncate">
                          {primaryCol.mobilePrimary!(row)}
                        </div>
                      )}
                      {secondaryCol && (
                        <div className="text-body-sm text-text-secondary truncate mt-0.5">
                          {secondaryCol.mobileSecondary!(row)}
                        </div>
                      )}
                    </div>
                    {badgeCol && (
                      <div className="shrink-0">
                        {badgeCol.mobileBadge!(row)}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: accent + chevron */}
                  <div className="flex items-center justify-between gap-3 mt-3">
                    {accentCol ? (
                      <div className="text-body-lg font-medium text-text-primary">
                        {accentCol.mobileAccent!(row)}
                      </div>
                    ) : (
                      <div />
                    )}
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                  </div>
                </button>
              );
            })}
      </div>

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
