"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface FreeModel {
  id: string;
  label: string;
  description: string | null;
}

interface Props {
  value: string;
  onChange: (modelId: string) => void;
  dropUp?: boolean;
}

export default function ModelPicker({
  value,
  onChange,
  dropUp = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<FreeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch free models on mount
  useEffect(() => {
    fetch("/api/admin/chat/models")
      .then((r) => r.json())
      .then((data) => {
        const free = (data.models ?? []).filter(
          (m: { status: string }) => m.status === "FREE",
        );
        setModels(free);
      })
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  // Click outside closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = models.find((m) => m.id === value);
  const displayLabel = current?.label ?? (value || "Select model");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading || models.length === 0}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md",
          "bg-bg-sunken border border-border-subtle",
          "text-micro font-mono text-brand-primary",
          "hover:bg-bg-elevated transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span>{displayLabel}</span>
        )}
        <ChevronDown
          className={cn("w-3 h-3 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && models.length > 0 && (
        <div
          className={cn(
            "absolute left-0 z-50",
            dropUp ? "bottom-full mb-2" : "top-full mt-1",
            "w-64 rounded-xl bg-bg-elevated border border-border-default",
            "shadow-2xl overflow-hidden",
          )}
        >
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
              Free models
            </p>
            <span className="text-micro text-text-muted">{models.length}</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {models.map((m) => {
              const isActive = m.id === value;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-start gap-2",
                    "hover:bg-bg-sunken transition-colors",
                    isActive && "bg-bg-sunken",
                  )}
                >
                  <Check
                    className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      isActive ? "text-brand-primary" : "opacity-0",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-body-sm font-medium truncate",
                        isActive ? "text-brand-primary" : "text-text-primary",
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="text-micro font-mono text-text-muted truncate">
                      {m.id}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && models.length === 0 && (
        <div
          className={cn(
            "absolute left-0 z-50 w-64 rounded-xl bg-bg-elevated border border-border-default p-3 shadow-2xl",
            dropUp ? "bottom-full mb-2" : "top-full mt-1",
          )}
        >
          <p className="text-body-sm text-text-muted">
            No free models found. Visit{" "}
            <a
              href="/admin/ai-models"
              className="text-brand-primary hover:underline"
            >
              Models
            </a>{" "}
            and run tests.
          </p>
        </div>
      )}
    </div>
  );
}
