// components/pro-table/ProTable.tsx
"use client";

import { useState } from "react";
import { Search, Inbox, LayoutList, Rows3 } from "lucide-react";
import { useViewport, useSortedData, useSearchedData } from "./hooks";
import { ProTableDesktop } from "./ProTableDesktop";
import { ProTableList } from "./ProTableList"; // 🆕
import { ProTableCards } from "./ProTableCards"; // 🆕
import type { ProTableProps, ProTableDensity } from "./types";
import EmptyState from "../organisms/EmptyState";
import Card from "../atoms/Card";
import { cn } from "@/lib/utils/utils";
import Input from "../atoms/Input";
import IconButton from "../atoms/IconButton";

export default function ProTable<T>(props: ProTableProps<T>) {
  const {
    data,
    search = false,
    searchPlaceholder = "Search...",
    searchKeys,
    searchPredicate,
    defaultSort,
    columns,
    loading = false,
    emptyState,
    emptyTitle = "No results",
    emptyDescription = "Try adjusting your filters or search",
    filters,
    className,
    density: densityProp = "comfortable",
    title,
    description,
    toolbarActions,
    showDensityToggle = false,
    mobileMode = "cards", // 🆕 new default
  } = props;

  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<ProTableDensity>(densityProp);

  const searched = useSearchedData(data, query, {
    searchKeys,
    searchPredicate,
  });
  const { sortedData, sortState, toggleSort } = useSortedData(
    searched,
    columns,
    defaultSort,
  );

  // 🆕 Viewport-aware rendering
  const viewport = useViewport();

  const hasHeader = !!(title || description);
  const hasToolbar = search || filters || toolbarActions || showDensityToggle;
  const isEmpty = !loading && sortedData.length === 0;

  // 🆕 Pick the right table renderer
  const tableProps = {
    ...props,
    data: sortedData,
    loading,
    density,
  };

  let TableContent: React.ReactNode;
  if (isEmpty) {
    TableContent = (
      <div className="py-8 flex-1">
        {emptyState ?? (
          <EmptyState
            icon={<Inbox />}
            title={emptyTitle}
            description={emptyDescription}
            size="md"
          />
        )}
      </div>
    );
  } else if (viewport === "mobile") {
    TableContent =
      mobileMode === "list" ? (
        <ProTableList {...tableProps} />
      ) : (
        <ProTableCards {...tableProps} />
      );
  } else if (viewport === "tablet") {
    TableContent = <ProTableList {...tableProps} />;
  } else {
    TableContent = (
      <ProTableDesktop
        {...tableProps}
        sortState={sortState}
        onSort={toggleSort}
      />
    );
  }

  return (
    <Card
      padding="none"
      className={cn("overflow-hidden flex flex-col", className)}
    >
      {/* Title/description */}
      {hasHeader && (
        <div className="px-4 py-3 border-b border-border-subtle">
          {title && <h2 className="text-h4 text-text-primary">{title}</h2>}
          {description && (
            <p className="text-body-sm text-text-secondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Toolbar */}
      {hasToolbar && (
        <div
          className={cn(
            "flex items-center gap-3 flex-wrap",
            "px-4 py-3 border-b border-border-subtle",
            "bg-bg-elevated",
          )}
        >
          {search && (
            <div className="flex-1 min-w-50 max-w-md">
              <Input
                leadingIcon={<Search />}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                inputSize="md"
              />
            </div>
          )}

          {filters && (
            <div className="flex items-center gap-2 flex-wrap">{filters}</div>
          )}

          <div className="flex-1 min-w-0" />

          {!loading && (
            <span className="text-body-sm text-text-muted whitespace-nowrap">
              {sortedData.length}{" "}
              {sortedData.length === 1 ? "result" : "results"}
            </span>
          )}

          {/* Density toggle only on desktop */}
          {showDensityToggle && viewport === "desktop" && (
            <IconButton
              label={
                density === "compact" ? "Comfortable view" : "Compact view"
              }
              icon={density === "compact" ? <Rows3 /> : <LayoutList />}
              variant="ghost"
              size="sm"
              onClick={() =>
                setDensity((d) => (d === "compact" ? "comfortable" : "compact"))
              }
              showTooltip
            />
          )}

          {toolbarActions && (
            <div className="flex items-center gap-2 flex-wrap">
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      {/* Viewport-aware content */}
      {TableContent}
    </Card>
  );
}

export type { ProTableColumn, ProTableAction, ProTableProps } from "./types";
