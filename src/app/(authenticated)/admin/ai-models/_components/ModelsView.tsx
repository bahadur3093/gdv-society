"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, RefreshCw, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import ModelCard, { type ModelData } from "../../chat/_components/ModelCard";

interface Props {
  initialModels: ModelData[];
}

type StatusFilter = "ALL" | "FREE" | "PAID" | "UNKNOWN" | "ERROR";

export default function ModelsView({ initialModels }: Props) {
  const [models, setModels] = useState<ModelData[]>(initialModels);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [syncing, startSyncing] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: models.length,
      free: models.filter((m) => m.status === "FREE").length,
      paid: models.filter((m) => m.status === "PAID").length,
      unknown: models.filter((m) => m.status === "UNKNOWN").length,
    }),
    [models],
  );

  const filtered = useMemo(() => {
    let list = models;
    if (filter !== "ALL") list = list.filter((m) => m.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) || m.label.toLowerCase().includes(q),
      );
    }
    return list;
  }, [models, filter, search]);

  const handleSync = () => {
    startSyncing(async () => {
      setSyncMessage(null);
      try {
        const res = await fetch("/api/admin/chat/models/sync", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          setSyncMessage(`Sync failed: ${data.error ?? "Unknown"}`);
          return;
        }
        // Reload list
        const listRes = await fetch("/api/admin/chat/models");
        if (listRes.ok) {
          const listData = await listRes.json();
          setModels(listData.models);
        }
        setSyncMessage(
          `${data.added} added, ${data.updated} updated, ${data.total} total`,
        );
      } catch (e) {
        setSyncMessage(e instanceof Error ? e.message : "Sync error");
      }
    });
  };

  const handleModelUpdate = (updated: ModelData) => {
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Models</h1>
          <p className="text-body-sm text-text-muted">
            Manage available Ollama Cloud models
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatChip label="Total" value={counts.total} />
            <StatChip label="Free" value={counts.free} color="success" />
            <StatChip label="Paid" value={counts.paid} color="danger" />
            <StatChip label="Untested" value={counts.unknown} color="muted" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className={cn(
            "inline-flex items-center gap-2 px-5 h-11 rounded-full",
            "bg-[image:var(--gradient-brand)] text-white font-medium",
            "shadow-lg shadow-brand-primary/20",
            "hover:scale-[1.02] active:scale-[0.98]",
            "transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{syncing ? "Syncing…" : "Sync from Ollama"}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="rounded-md bg-info/10 border border-info/30 text-info text-body-sm px-4 py-2">
          {syncMessage}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:w-[40%]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className={cn(
              "w-full h-10 pl-10 pr-3 rounded-xl",
              "bg-bg-sunken border border-border-default",
              "text-body-sm text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              "focus:border-brand-primary",
            )}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["ALL", "FREE", "PAID", "UNKNOWN"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 px-4 h-9 rounded-full",
                "text-body-sm font-medium",
                "transition-colors",
                filter === f
                  ? "bg-brand-primary text-white"
                  : "bg-bg-sunken border border-border-default text-text-secondary hover:text-text-primary",
              )}
            >
              {f === "UNKNOWN"
                ? "Untested"
                : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / Empty */}
      {filtered.length === 0 ? (
        <EmptyState
          hasAny={models.length > 0}
          onSync={handleSync}
          syncing={syncing}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((m) => (
            <ModelCard key={m.id} model={m} onUpdate={handleModelUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: number;
  color?: "default" | "success" | "danger" | "muted";
}) {
  const dotColor =
    color === "success"
      ? "bg-success"
      : color === "danger"
        ? "bg-danger"
        : color === "muted"
          ? "bg-text-muted"
          : "bg-brand-primary";

  return (
    <div className="bg-bg-sunken border border-border-subtle rounded-full px-3 py-1 flex items-center gap-2">
      {color !== "default" && (
        <span className={cn("w-2 h-2 rounded-full", dotColor)} />
      )}
      <span className="text-micro uppercase tracking-wider text-text-secondary">
        {label}:
      </span>
      <span className="text-body-sm font-mono font-bold text-text-primary">
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  hasAny,
  onSync,
  syncing,
}: {
  hasAny: boolean;
  onSync: () => void;
  syncing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-[image:var(--gradient-brand)] opacity-10 blur-3xl rounded-full" />
        <div
          className={cn(
            "relative z-10 w-20 h-20 rounded-2xl",
            "bg-bg-elevated border border-border-default",
            "flex items-center justify-center",
            "shadow-inner",
          )}
        >
          <Package className="w-10 h-10 text-text-muted" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h3 className="text-h3 font-semibold text-text-primary">
          {hasAny ? "No matches" : "No models found"}
        </h3>
        <p className="text-body-sm text-text-secondary">
          {hasAny
            ? "Try a different search or filter."
            : "Your registry is empty. Click 'Sync from Ollama' to fetch the latest list of available models."}
        </p>
      </div>

      {!hasAny && (
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className={cn(
            "inline-flex items-center gap-2 px-6 h-11 rounded-full",
            "bg-(image:--gradient-brand) text-white font-medium",
            "shadow-xl shadow-brand-primary/30",
            "hover:scale-[1.02] active:scale-[0.98]",
            "transition-all",
            "disabled:opacity-60",
          )}
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Sync Models
        </button>
      )}
    </div>
  );
}
