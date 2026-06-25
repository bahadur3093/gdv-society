"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search as SearchIcon,
  Loader2,
  Users,
  Home,
  Wallet,
  X,
  AlertCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import "@/lib/telegram/web-app-types";

interface SearchResident {
  id: string;
  name: string;
  email: string;
  plotNumber: string | null;
  accountStatus: "PENDING" | "APPROVED" | "SUSPENDED";
  villaNo: number | null;
  outstanding: number;
}

interface SearchVilla {
  id: string;
  villaNo: number;
  ownerName: string;
  areaInSqFt: number;
  isBillable: boolean;
  residentName: string | null;
  residentEmail: string | null;
  residentId: string | null;
  outstanding: number;
}

interface SearchResults {
  residents: SearchResident[];
  villas: SearchVilla[];
  empty: boolean;
}

export default function TelegramSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const performSearch = useCallback(async (q: string) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      setError("Open from Telegram");
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const res = await fetch("/api/telegram/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData, query: q }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? `Failed (${res.status})`);
        setResults(null);
        return;
      }

      setResults(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const sendReminder = async (residentId: string) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    setSendingReminder(residentId);
    tg.HapticFeedback?.impactOccurred("medium");

    try {
      const res = await fetch("/api/telegram/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData, residentId }),
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        tg.HapticFeedback?.notificationOccurred("success");
        tg.showAlert?.(json.message ?? "Reminder sent");
      } else {
        tg.HapticFeedback?.notificationOccurred("error");
        tg.showAlert?.(json.message ?? json.error ?? "Failed to send");
      }
    } catch (e) {
      tg.HapticFeedback?.notificationOccurred("error");
      tg.showAlert?.(e instanceof Error ? e.message : "Network error");
    } finally {
      setSendingReminder(null);
    }
  };

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      <div>
        <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
          Search
        </p>
        <h1 className="text-h2 font-bold text-text-primary">Find anyone</h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Name, email or villa number"
          className={cn(
            "w-full h-12 pl-12 pr-12",
            "bg-bg-elevated border border-border-default rounded-xl",
            "text-body text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
            "transition-all",
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-sunken hover:bg-border-default flex items-center justify-center"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        )}
      </div>

      {/* Status row */}
      {searching && (
        <div className="flex items-center justify-center gap-2 text-body-sm text-text-muted py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Searching…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 bg-danger/15 border border-danger/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-body-sm text-danger">{error}</p>
        </div>
      )}

      {/* Empty state — initial */}
      {!query && (
        <div className="rounded-xl p-6 bg-bg-elevated border border-border-default text-center">
          <SearchIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-body-sm text-text-muted">
            Type at least 2 characters
          </p>
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && !searching && results?.empty && (
        <div className="rounded-xl p-6 bg-bg-elevated border border-border-default text-center">
          <p className="text-body-sm text-text-muted">
            No matches for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {/* Villa results */}
      {results && results.villas.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            icon={<Home />}
            label="Villas"
            count={results.villas.length}
          />
          {results.villas.map((v) => (
            <VillaCard
              key={v.id}
              villa={v}
              isSending={sendingReminder === v.residentId}
              onReminder={
                v.residentId && v.outstanding > 0
                  ? () => sendReminder(v.residentId!)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Resident results */}
      {results && results.residents.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            icon={<Users />}
            label="Residents"
            count={results.residents.length}
          />
          {results.residents.map((r) => (
            <ResidentCard
              key={r.id}
              resident={r}
              isSending={sendingReminder === r.id}
              onReminder={
                r.outstanding > 0 ? () => sendReminder(r.id) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 text-text-muted">
      <span className="w-4 h-4 inline-flex">{icon}</span>
      <span className="text-micro uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="text-body-sm font-mono">({count})</span>
    </div>
  );
}

function ResidentCard({
  resident,
  isSending,
  onReminder,
}: {
  resident: SearchResident;
  isSending: boolean;
  onReminder?: () => void;
}) {
  const statusColor =
    resident.accountStatus === "APPROVED"
      ? "text-success bg-success/15 border-success/30"
      : resident.accountStatus === "PENDING"
        ? "text-warning bg-warning/15 border-warning/30"
        : "text-danger bg-danger/15 border-danger/30";

  return (
    <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center font-semibold shrink-0">
          {resident.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-body font-medium text-text-primary truncate flex-1">
              {resident.name}
            </p>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
                statusColor,
              )}
            >
              {resident.accountStatus.charAt(0)}
              {resident.accountStatus.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-body-sm text-text-muted truncate">
            {resident.email}
          </p>
          <div className="flex items-center gap-3 mt-1 text-micro text-text-muted">
            {resident.villaNo !== null && (
              <span className="flex items-center gap-1">
                <Home className="w-2.5 h-2.5" />
                Villa {resident.villaNo}
              </span>
            )}
            {resident.outstanding > 0 && (
              <span className="flex items-center gap-1 text-danger font-semibold">
                <Wallet className="w-2.5 h-2.5" />₹
                {resident.outstanding.toLocaleString("en-IN")} due
              </span>
            )}
          </div>
        </div>
      </div>

      {onReminder && (
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={onReminder}
            disabled={isSending}
            className={cn(
              "w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
              "bg-bg-sunken border border-border-default",
              "text-body-sm font-medium text-text-primary",
              "hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Send reminder
          </button>
        </div>
      )}
    </div>
  );
}

function VillaCard({
  villa,
  isSending,
  onReminder,
}: {
  villa: SearchVilla;
  isSending: boolean;
  onReminder?: () => void;
}) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-h3 font-bold text-text-primary font-mono">
              Villa {villa.villaNo}
            </p>
            <p className="text-body-sm text-text-muted">
              {villa.areaInSqFt} sqft ·{" "}
              {villa.isBillable ? "Billable" : "Not billable"}
            </p>
          </div>
          {villa.outstanding > 0 && (
            <div className="text-right">
              <p className="text-body font-bold text-danger font-mono">
                ₹{villa.outstanding.toLocaleString("en-IN")}
              </p>
              <p className="text-micro text-text-muted">outstanding</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border-subtle space-y-1">
          <p className="text-body-sm text-text-primary">
            <span className="text-text-muted">Owner:</span> {villa.ownerName}
          </p>
          {villa.residentName ? (
            <p className="text-body-sm text-text-primary">
              <span className="text-text-muted">Resident:</span>{" "}
              {villa.residentName}
            </p>
          ) : (
            <p className="text-body-sm text-warning italic">Not claimed</p>
          )}
        </div>
      </div>

      {onReminder && (
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={onReminder}
            disabled={isSending}
            className={cn(
              "w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
              "bg-bg-sunken border border-border-default",
              "text-body-sm font-medium text-text-primary",
              "hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Send reminder
          </button>
        </div>
      )}
    </div>
  );
}
