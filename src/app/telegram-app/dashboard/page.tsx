"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  Users,
  Home,
  Wallet,
  TrendingDown,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface DashboardData {
  stats: {
    pendingCount: number;
    unpaidVillasCount: number;
    totalResidents: number;
    totalOutstanding: number;
    expensesThisMonth: number;
    monthLabel: string;
  };
  latestPending: Array<{
    id: string;
    name: string;
    email: string;
    plotNumber: string | null;
    signedUpAt: string;
  }>;
  verifiedAs: {
    firstName: string;
    username?: string;
  };
}

export default function TelegramDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Open this page from inside Telegram");
      setLoading(false);
      return;
    }

    if (!tg.initData) {
      setError("Telegram authentication not available");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
      tg.HapticFeedback?.impactOccurred("light");
    }

    try {
      const res = await fetch("/api/telegram/dashboard-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error ?? `Request failed (${res.status})`);
        tg.HapticFeedback?.notificationOccurred("error");
        return;
      }

      const json = (await res.json()) as DashboardData;
      setData(json);
      setError(null);
      if (isRefresh) {
        tg.HapticFeedback?.notificationOccurred("success");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    fetchData(false);
  }, [fetchData]);

  // Pull-to-refresh: when user pulls down at scroll top
  useEffect(() => {
    let startY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return;
      const delta = e.touches[0].clientY - startY;
      if (delta > 80 && !refreshing) {
        pulling = false;
        fetchData(true);
      }
    };

    const handleTouchEnd = () => {
      pulling = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [fetchData, refreshing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-body-sm text-text-muted">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h1 className="text-h3 font-bold text-text-primary">
            Can&apos;t load dashboard
          </h1>
          <p className="text-body-sm text-text-muted">{error}</p>
          <button
            type="button"
            onClick={() => fetchData(false)}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-bg-elevated border border-border-default text-body-sm font-medium hover:bg-bg-sunken transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
          Hi {data.verifiedAs.firstName}
        </p>
        <h1 className="text-h2 font-bold text-text-primary">
          Society overview
        </h1>
      </div>

      {refreshing && (
        <div className="flex items-center justify-center gap-2 text-body-sm text-text-muted py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Refreshing…</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Clock />}
          label="Pending"
          value={data.stats.pendingCount.toString()}
          variant={data.stats.pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard
          icon={<Wallet />}
          label="Unpaid villas"
          value={data.stats.unpaidVillasCount.toString()}
          variant={data.stats.unpaidVillasCount > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={<Users />}
          label="Active residents"
          value={data.stats.totalResidents.toString()}
        />
        <StatCard
          icon={<Home />}
          label="Outstanding"
          value={formatCurrency(data.stats.totalOutstanding)}
          variant={data.stats.totalOutstanding > 0 ? "danger" : "default"}
        />
      </div>

      {/* Expenses this month */}
      <div className="rounded-xl p-4 bg-bg-elevated border border-border-default flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-info/15 text-info flex items-center justify-center shrink-0">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-text-muted">
            {data.stats.monthLabel} expenses
          </p>
          <p className="text-h3 font-bold text-text-primary font-mono">
            {formatCurrency(data.stats.expensesThisMonth)}
          </p>
        </div>
      </div>

      {/* Pending signups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-body font-semibold text-text-primary">
            Latest pending
          </h2>
          <span className="text-body-sm text-text-muted">
            {data.latestPending.length} of {data.stats.pendingCount}
          </span>
        </div>

        {data.latestPending.length === 0 ? (
          <div className="rounded-xl p-6 bg-bg-elevated border border-border-default text-center">
            <p className="text-body-sm text-text-muted">No pending users 🎉</p>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
            {data.latestPending.map((user, idx) => (
              <div
                key={user.id}
                className={cn(
                  "p-3 flex items-start gap-3",
                  idx > 0 && "border-t border-border-subtle",
                )}
              >
                <div className="w-9 h-9 rounded-full bg-warning/15 text-warning flex items-center justify-center font-semibold text-body-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-text-primary truncate">
                    {user.name}
                  </p>
                  <p className="text-body-sm text-text-muted truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {user.plotNumber && (
                      <span className="text-micro font-mono text-text-muted">
                        Plot {user.plotNumber}
                      </span>
                    )}
                    <span className="text-micro text-text-muted">
                      {timeAgo(user.signedUpAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-micro text-text-muted text-center pt-4 pb-2">
        Pull down to refresh
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl p-4 bg-bg-elevated border border-border-default space-y-2">
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center",
          variant === "warning" && "bg-warning/15 text-warning",
          variant === "danger" && "bg-danger/15 text-danger",
          variant === "default" && "bg-brand-primary/15 text-brand-primary",
        )}
      >
        <span className="w-4 h-4 inline-flex">{icon}</span>
      </div>
      <p className="text-body-sm text-text-muted">{label}</p>
      <p className="text-h3 font-bold text-text-primary font-mono">{value}</p>
    </div>
  );
}

function formatCurrency(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}
