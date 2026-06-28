"use client";

import { useMemo, useState } from "react";
import {
  Lock,
  History,
  Info,
  AlertCircle,
  RefreshCw,
  Loader2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface ModelData {
  id: string;
  label: string;
  description: string | null;
  status: string; // FREE | PAID | UNKNOWN | ERROR
  lastTested: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  model: ModelData;
  onUpdate: (updated: ModelData) => void;
}

export default function ModelCard({ model, onUpdate }: Props) {
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testJustCompleted, setTestJustCompleted] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/chat/models/${encodeURIComponent(model.id)}/test`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Test failed");
        return;
      }
      onUpdate(data.model);
      setTestJustCompleted(true);
      setTimeout(() => setTestJustCompleted(false), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setTesting(false);
    }
  };

//   const isFree = model.status === "FREE";
  const isPaid = model.status === "PAID";
  const isUnknown = model.status === "UNKNOWN";
  const isError = model.status === "ERROR";

  return (
    <div
      className={cn(
        "relative p-5 rounded-2xl group transition-all",
        "bg-bg-elevated/70 backdrop-blur-md",
        "border",
        isPaid
          ? "border-danger/20"
          : isError
            ? "border-warning/20"
            : "border-border-default hover:border-brand-primary/30",
        isUnknown && "opacity-90",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
      )}
    >
      {/* Top: ID + label + status badge */}
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-mono text-micro tracking-wider mb-1 truncate",
              isPaid
                ? "text-danger"
                : isError
                  ? "text-warning"
                  : "text-brand-primary",
            )}
          >
            {model.id}
          </p>
          <h3 className="text-h4 font-semibold text-text-primary truncate">
            {model.label}
          </h3>
        </div>

        <StatusBadge status={model.status} testing={testing} />
      </div>

      {/* Description */}
      {model.description && (
        <p className="text-body-sm text-text-secondary mb-5">
          {model.description}
        </p>
      )}

      {/* Error block for PAID/ERROR */}
      {(isPaid || isError) && model.lastError && testJustCompleted && (
        <div
          className={cn(
            "rounded-lg p-3 flex gap-2 items-start mb-4",
            isPaid
              ? "bg-danger/5 border border-danger/15"
              : "bg-warning/5 border border-warning/15",
          )}
        >
          <AlertCircle
            className={cn(
              "w-4 h-4 shrink-0 mt-0.5",
              isPaid ? "text-danger" : "text-warning",
            )}
          />
          <span
            className={cn(
              "text-body-sm font-mono leading-snug",
              isPaid ? "text-danger" : "text-warning",
            )}
          >
            {truncate(model.lastError, 140)}
          </span>
        </div>
      )}

      {/* Footer: last tested + action */}
      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <span className="text-body-sm text-text-muted flex items-center gap-1.5">
          {model.lastTested ? (
            <>
              <History className="w-3.5 h-3.5" />
              <span>Tested {timeAgo(model.lastTested)}</span>
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5" />
              <span>Never tested</span>
            </>
          )}
        </span>

        {isPaid ? (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-1 text-danger hover:underline text-body-sm font-medium disabled:opacity-60"
          >
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Retry
          </button>
        ) : (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg",
              "bg-bg-sunken border border-border-default",
              "text-body-sm text-text-primary font-medium",
              "hover:border-brand-primary/50 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Testing
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Test
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-body-sm text-danger">{error}</p>}
    </div>
  );
}

function StatusBadge({
  status,
  testing,
}: {
  status: string;
  testing: boolean;
}) {
  if (testing) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
          "bg-brand-primary/10 border border-brand-primary/30",
          "text-brand-primary text-[10px] font-bold uppercase tracking-wider",
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
        Testing
      </span>
    );
  }

  switch (status) {
    case "FREE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider">
          Free
        </span>
      );
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/30 text-danger text-[10px] font-bold uppercase tracking-wider">
          <Lock className="w-2.5 h-2.5" />
          Paid
        </span>
      );
    case "ERROR":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30 text-warning text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle className="w-2.5 h-2.5" />
          Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-text-muted/10 border border-text-muted/30 text-text-muted text-[10px] font-bold uppercase tracking-wider">
          Unknown
        </span>
      );
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
