"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  Inbox as InboxIcon,
  RefreshCw,
  Clock,
  Wallet,
  CheckCircle2,
  XCircle,
  Hash,
  Mail,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  plotNumber: string | null;
  signedUpAt: string;
}

interface PendingPayment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  submittedAt: string;
  villaNo: number;
  residentName: string;
  residentEmail: string;
}

interface InboxData {
  pendingUsers: PendingUser[];
  pendingPayments: PendingPayment[];
  counts: {
    pendingUsers: number;
    pendingPayments: number;
    total: number;
  };
}

interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
  showAlert?: (message: string) => void;
  showConfirm?: (
    message: string,
    callback: (confirmed: boolean) => void,
  ) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

type Tab = "users" | "payments";

export default function TelegramInboxPage() {
  const [data, setData] = useState<InboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("users");
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      setError("Open this page from inside Telegram");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
      tg.HapticFeedback?.impactOccurred("light");
    }

    try {
      const res = await fetch("/api/telegram/inbox-data", {
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

      const json = (await res.json()) as InboxData;
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

  // Pull-to-refresh
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

  const performAction = async (
    action:
      | "approve_user"
      | "suspend_user"
      | "approve_payment"
      | "reject_payment",
    targetId: string,
    reason?: string,
  ) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    setActingOn(targetId);
    tg.HapticFeedback?.impactOccurred("medium");

    try {
      const res = await fetch("/api/telegram/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg.initData,
          action,
          targetId,
          reason,
        }),
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        tg.HapticFeedback?.notificationOccurred("success");
        tg.showAlert?.(json.message ?? "Done");
        // Optimistic update: remove from list
        setData((prev) => {
          if (!prev) return prev;
          if (action === "approve_user" || action === "suspend_user") {
            const remaining = prev.pendingUsers.filter(
              (u) => u.id !== targetId,
            );
            return {
              ...prev,
              pendingUsers: remaining,
              counts: {
                ...prev.counts,
                pendingUsers: remaining.length,
                total: remaining.length + prev.counts.pendingPayments,
              },
            };
          } else {
            const remaining = prev.pendingPayments.filter(
              (p) => p.id !== targetId,
            );
            return {
              ...prev,
              pendingPayments: remaining,
              counts: {
                ...prev.counts,
                pendingPayments: remaining.length,
                total: prev.counts.pendingUsers + remaining.length,
              },
            };
          }
        });
      } else {
        tg.HapticFeedback?.notificationOccurred("error");
        tg.showAlert?.(json.message ?? json.error ?? "Failed");
      }
    } catch (e) {
      tg.HapticFeedback?.notificationOccurred("error");
      tg.showAlert?.(e instanceof Error ? e.message : "Network error");
    } finally {
      setActingOn(null);
    }
  };

  const confirmAndAct = (
    action: "approve_user" | "suspend_user" | "approve_payment",
    targetId: string,
    label: string,
  ) => {
    const tg = window.Telegram?.WebApp;
    const message = `${label}?`;
    if (tg?.showConfirm) {
      tg.showConfirm(message, (confirmed) => {
        if (confirmed) performAction(action, targetId);
      });
    } else if (confirm(message)) {
      performAction(action, targetId);
    }
  };

  const rejectPaymentWithReason = (targetId: string) => {
    const reason = prompt(
      "Reason for rejection (will be shown to resident):",
      "",
    );
    if (reason && reason.trim()) {
      performAction("reject_payment", targetId, reason.trim());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-body-sm text-text-muted">Loading inbox…</p>
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
            Can&apos;t load inbox
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

  const items = tab === "users" ? data.pendingUsers : data.pendingPayments;

  return (
    <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
            Inbox
          </p>
          <h1 className="text-h2 font-bold text-text-primary">
            {data.counts.total === 0
              ? "All clear 🎉"
              : `${data.counts.total} pending`}
          </h1>
        </div>
        {refreshing && (
          <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-bg-elevated p-1 rounded-full border border-border-default">
        <Tab
          active={tab === "users"}
          onClick={() => setTab("users")}
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Signups"
          count={data.counts.pendingUsers}
        />
        <Tab
          active={tab === "payments"}
          onClick={() => setTab("payments")}
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Payments"
          count={data.counts.pendingPayments}
        />
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-xl p-8 bg-bg-elevated border border-border-default text-center">
          <InboxIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-body-sm text-text-muted">
            Nothing pending right now
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tab === "users" &&
            data.pendingUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isActing={actingOn === user.id}
                onApprove={() =>
                  confirmAndAct("approve_user", user.id, `Approve ${user.name}`)
                }
                onSuspend={() =>
                  confirmAndAct("suspend_user", user.id, `Reject ${user.name}`)
                }
              />
            ))}

          {tab === "payments" &&
            data.pendingPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                isActing={actingOn === payment.id}
                onApprove={() =>
                  confirmAndAct(
                    "approve_payment",
                    payment.id,
                    `Approve ₹${payment.amount.toLocaleString("en-IN")} payment from ${payment.residentName}`,
                  )
                }
                onReject={() => rejectPaymentWithReason(payment.id)}
              />
            ))}
        </div>
      )}

      <p className="text-micro text-text-muted text-center pt-4 pb-2">
        Pull down to refresh
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Tab button
// ─────────────────────────────────────────────────────────────

function Tab({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 h-9 rounded-full",
        "text-body-sm font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        active
          ? "bg-bg-sunken text-text-primary"
          : "text-text-muted hover:text-text-primary",
      )}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
            active
              ? "bg-brand-primary text-white"
              : "bg-bg-sunken text-text-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  User card
// ─────────────────────────────────────────────────────────────

function UserCard({
  user,
  isActing,
  onApprove,
  onSuspend,
}: {
  user: PendingUser;
  isActing: boolean;
  onApprove: () => void;
  onSuspend: () => void;
}) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-warning/15 text-warning flex items-center justify-center font-semibold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-text-primary truncate">
            {user.name}
          </p>
          <p className="text-body-sm text-text-muted flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 shrink-0" />
            {user.email}
          </p>
          <div className="flex items-center gap-3 mt-1 text-micro text-text-muted">
            {user.plotNumber && (
              <span className="flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />
                Plot {user.plotNumber}
              </span>
            )}
            <span>{timeAgo(user.signedUpAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-3 pt-0">
        <button
          type="button"
          onClick={onSuspend}
          disabled={isActing}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
            "bg-bg-sunken border border-border-default",
            "text-body-sm font-medium text-text-secondary",
            "hover:bg-danger/10 hover:text-danger hover:border-danger/30",
            "transition-colors duration-[var(--duration-fast)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isActing}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
            "bg-[image:var(--gradient-brand)]",
            "text-body-sm font-semibold text-white",
            "shadow-md",
            "hover:opacity-95 active:scale-[0.98]",
            "transition-all duration-[var(--duration-fast)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isActing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Approve
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Payment card
// ─────────────────────────────────────────────────────────────

function PaymentCard({
  payment,
  isActing,
  onApprove,
  onReject,
}: {
  payment: PendingPayment;
  isActing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Amount + meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-h3 font-bold text-text-primary font-mono">
              ₹{payment.amount.toLocaleString("en-IN")}
            </p>
            <p className="text-body-sm text-text-muted">
              {payment.method} · Villa {payment.villaNo}
            </p>
          </div>
          <span className="text-micro text-text-muted shrink-0">
            {timeAgo(payment.submittedAt)}
          </span>
        </div>

        {/* Resident */}
        <div className="flex items-center gap-2 text-body-sm">
          <div className="w-7 h-7 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center font-semibold text-micro shrink-0">
            {payment.residentName.charAt(0).toUpperCase()}
          </div>
          <span className="text-text-primary truncate">
            {payment.residentName}
          </span>
        </div>

        {/* Reference */}
        {payment.reference && (
          <div className="flex items-start gap-2 text-body-sm text-text-muted">
            <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <code className="text-micro font-mono break-all">
              {payment.reference}
            </code>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <p className="text-body-sm text-text-muted italic line-clamp-2">
            &ldquo;{payment.notes}&rdquo;
          </p>
        )}
      </div>

      <div className="flex gap-2 p-3 pt-0">
        <button
          type="button"
          onClick={onReject}
          disabled={isActing}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
            "bg-bg-sunken border border-border-default",
            "text-body-sm font-medium text-text-secondary",
            "hover:bg-danger/10 hover:text-danger hover:border-danger/30",
            "transition-colors duration-[var(--duration-fast)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isActing}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full",
            "bg-[image:var(--gradient-brand)]",
            "text-body-sm font-semibold text-white",
            "shadow-md",
            "hover:opacity-95 active:scale-[0.98]",
            "transition-all duration-[var(--duration-fast)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isActing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Approve
        </button>
      </div>
    </div>
  );
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
