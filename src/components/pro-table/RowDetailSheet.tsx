"use client";

import Link from "next/link";
import {
  normalizeActions,
  type ProTableColumn,
  type ProTableProps,
} from "./types";
import BottomSheet from "../organisms/BottomSheet";
import Button from "../atoms/Button";
import { cn } from "@/lib/utils/utils";

interface RowDetailSheetProps<T> {
  row: T | null;
  columns: ProTableColumn<T>[];
  actions?: ProTableProps<T>["actions"];
  rowKey: ProTableProps<T>["rowKey"];
  onClose: () => void;
}

export function RowDetailSheet<T>({
  row,
  columns,
  actions,
  onClose,
}: RowDetailSheetProps<T>) {
  if (!row) return null;

  // 🆕 Normalize INSIDE the component — TypeScript happy
  const normalizedActions = normalizeActions(actions, row);

  const primaryCol = columns.find((c) => c.mobilePrimary) ?? columns[0];
  const secondaryCol = columns.find((c) => c.mobileSecondary);

  const detailColumns = columns.filter(
    (c) =>
      c.key !== primaryCol?.key &&
      c.key !== secondaryCol?.key &&
      !c.hideOn?.includes("mobile"),
  );

  return (
    <BottomSheet
      open={!!row}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={primaryCol?.mobilePrimary?.(row) ?? primaryCol?.desktop(row)}
      description={
        secondaryCol?.mobileSecondary?.(row) ?? secondaryCol?.desktop(row)
      }
      footer={
        normalizedActions.length > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            {normalizedActions.map((action, i) => {
              const href = action.href?.(row);
              const isPrimary = i === 0;
              const variant =
                action.variant === "danger"
                  ? "danger"
                  : isPrimary
                    ? "primary"
                    : "secondary";

              if (href) {
                return (
                  <Button
                    key={`${action.label}-${i}`}
                    asChild
                    variant={variant}
                    size="lg"
                    fullWidth
                    icon={action.icon}
                  >
                    <Link href={href}>{action.label}</Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={`${action.label}-${i}`}
                  variant={variant}
                  size="lg"
                  fullWidth
                  icon={action.icon}
                  onClick={() => {
                    action.onClick?.(row);
                    onClose();
                  }}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : null
      }
    >
      <dl className="space-y-3">
        {detailColumns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "flex items-start justify-between gap-3",
              "py-2 border-b border-border-subtle last:border-b-0",
            )}
          >
            <dt className="text-body-sm text-text-muted shrink-0">
              {col.label}
            </dt>
            <dd
              className={cn(
                "text-body text-text-primary text-right",
                "flex-1 min-w-0",
              )}
            >
              {col.desktop(row)}
            </dd>
          </div>
        ))}
      </dl>
    </BottomSheet>
  );
}
