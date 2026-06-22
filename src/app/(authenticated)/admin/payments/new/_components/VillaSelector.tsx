"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check, Home } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils/utils";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";

export interface VillaOption {
  villaId: string;
  villaNo: number;
  ownerName: string;
  userId: string | null;
  residentName: string | null;
  residentEmail: string | null;
  areaInSqFt: number;
  outstanding: number;
}

interface Props {
  villas: VillaOption[];
  value: string;
  onChange: (villaId: string) => void;
  required?: boolean;
}

export default function VillaSelector({
  villas,
  value,
  onChange,
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = villas.find((v) => v.villaId === value);

  // Filter villas by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return villas;
    return villas.filter((v) => {
      return (
        String(v.villaNo).includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.residentName?.toLowerCase().includes(q) ||
        v.residentEmail?.toLowerCase().includes(q)
      );
    });
  }, [villas, query]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-3",
          "px-3 h-12 rounded",
          "bg-bg-elevated border border-border-default",
          "text-left text-body",
          "transition-colors duration-(--duration-fast)",
          "hover:border-border-strong",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary/30 focus-visible:border-brand-primary",
          open && "border-brand-primary ring-2 ring-brand-primary/30",
        )}
      >
        {selected ? (
          <SelectedDisplay villa={selected} />
        ) : (
          <span className="flex-1 text-text-muted">Select a villa…</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-muted shrink-0",
            "transition-transform duration-(--duration-fast)",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Hidden input to bind value to form */}
      {required && (
        <input type="hidden" name="villaId" value={value} required />
      )}
      {!required && <input type="hidden" name="villaId" value={value} />}

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute z-30 left-0 right-0 mt-1.5",
            "bg-bg-elevated border border-border-default",
            "rounded-md shadow-lg overflow-hidden",
            "animate-[var(--animate-slide-down)]",
          )}
        >
          {/* Search */}
          <div className="p-2 border-b border-border-subtle">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by villa #, name, or email…"
                className={cn(
                  "w-full h-9 pl-8 pr-8",
                  "bg-bg-sunken border border-border-subtle rounded",
                  "text-body-sm text-text-primary",
                  "placeholder:text-text-muted",
                  "focus:outline-none focus:ring-1 focus:ring-brand-primary/30",
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    "w-5 h-5 rounded-full",
                    "flex items-center justify-center",
                    "text-text-muted hover:text-text-primary hover:bg-bg-elevated",
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto custom-scrollbar py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-body-sm text-text-muted">
                No villas match your search
              </li>
            ) : (
              filtered.map((v) => (
                <VillaOption
                  key={v.villaId}
                  villa={v}
                  selected={v.villaId === value}
                  onClick={() => {
                    onChange(v.villaId);
                    setOpen(false);
                    setQuery("");
                  }}
                />
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border-subtle bg-bg-sunken">
            <p className="text-micro uppercase text-text-muted tracking-wider">
              {filtered.length} of {villas.length} villas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Selected display (inside trigger)
// ─────────────────────────────────────────────────────────────

function SelectedDisplay({ villa }: { villa: VillaOption }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Avatar size="sm" name={villa.residentName ?? villa.ownerName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-body font-medium text-text-primary">
            Villa {villa.villaNo}
          </span>
          <span className="text-body-sm text-text-secondary truncate">
            {villa.residentName ?? villa.ownerName}
          </span>
        </div>
      </div>
      {villa.outstanding > 0 ? (
        <Badge size="sm" variant="danger" outline>
          Owes {formatCurrency(villa.outstanding)}
        </Badge>
      ) : (
        <Badge size="sm" variant="success" outline>
          Clear
        </Badge>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single option row
// ─────────────────────────────────────────────────────────────

function VillaOption({
  villa,
  selected,
  onClick,
}: {
  villa: VillaOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3",
          "px-3 py-2.5",
          "text-left",
          "transition-colors duration-[var(--duration-fast)]",
          "hover:bg-bg-sunken",
          "focus-visible:outline-none focus-visible:bg-bg-sunken",
          selected && "bg-brand-primary/10",
        )}
      >
        {/* Avatar */}
        <Avatar size="sm" name={villa.residentName ?? villa.ownerName} />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body font-medium text-text-primary">
              Villa {villa.villaNo}
            </span>
            <span className="text-body-sm text-text-secondary truncate">
              {villa.residentName ?? villa.ownerName}
            </span>
            {!villa.residentName && (
              <Badge size="sm" variant="warning" outline>
                Unclaimed
              </Badge>
            )}
          </div>
          {villa.residentEmail && (
            <p className="text-body-sm text-text-muted truncate mt-0.5">
              {villa.residentEmail}
            </p>
          )}
        </div>

        {/* Outstanding amount */}
        {villa.outstanding > 0 && (
          <span className="shrink-0 font-mono font-medium text-danger text-body-sm">
            {formatCurrency(villa.outstanding)}
          </span>
        )}

        {/* Check mark when selected */}
        {selected && <Check className="w-4 h-4 text-brand-primary shrink-0" />}
      </button>
    </li>
  );
}
