"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useNotifications } from "@/lib/notifications/use-notifications";
import { markAllNotificationsReadAction } from "@/lib/notifications/actions";
import NotificationItem from "./NotificationItem";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

export default function NotificationPanel({
  open,
  onOpenChange,
  anchorRef,
}: Props) {
  const {
    notifications,
    unreadCount,
    loading,
    refetch,
    setNotifications,
    setUnreadCount,
  } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [desktopPos, setDesktopPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track mobile vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: compute position relative to button
  useEffect(() => {
    if (!open || isMobile || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setDesktopPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open, isMobile, anchorRef]);

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  // Click outside (desktop only — mobile uses backdrop)
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, isMobile, onOpenChange, anchorRef]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!open || !isMobile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, isMobile]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  };

  const handleItemMarkedRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  if (!mounted || !open) return null;

  // ── DESKTOP: anchored dropdown ──
  if (!isMobile) {
    return createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        style={{
          top: `${desktopPos.top}px`,
          right: `${desktopPos.right}px`,
        }}
        className={cn(
          "fixed z-50",
          "w-[360px] max-h-[480px]",
          "rounded-xl bg-bg-elevated border border-border-default",
          "shadow-2xl",
          "flex flex-col overflow-hidden",
        )}
      >
        <PanelHeader
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => onOpenChange(false)}
        />
        <PanelList
          loading={loading}
          notifications={notifications}
          onClose={() => onOpenChange(false)}
          onMarkedRead={handleItemMarkedRead}
        />
      </div>,
      document.body,
    );
  }

  // ── MOBILE: bottom sheet ──
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex flex-col justify-end animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      >
        {/* Panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full bg-bg-elevated",
            "rounded-t-[20px]",
            "border-t border-white/10",
            "shadow-2xl flex flex-col",
            "animate-in slide-in-from-bottom duration-300",
            // Height 65% but capped so doesn't overlap fixed bottom nav
            "h-[calc(65dvh-env(safe-area-inset-bottom))]",
            // Push content above any fixed bottom nav (assumes ~80px nav)
            "mb-[calc(80px+env(safe-area-inset-bottom))]",
          )}
        >
          {/* Drag handle */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            aria-label="Close"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </button>

          <PanelHeader
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => onOpenChange(false)}
            isMobile
          />
          <PanelList
            loading={loading}
            notifications={notifications}
            onClose={() => onOpenChange(false)}
            onMarkedRead={handleItemMarkedRead}
          />
        </div>
      </div>
    </>,
    document.body,
  );
}

// ── Header subcomponent ──
function PanelHeader({
  unreadCount,
  onMarkAllRead,
  onClose,
  isMobile = false,
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
  onClose: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border-subtle shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <h3
          className={cn(
            "font-semibold text-text-primary",
            isMobile ? "text-h3 text-brand-primary" : "text-body-sm",
          )}
        >
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary text-[11px] font-bold whitespace-nowrap border border-brand-primary/20">
            {unreadCount} new
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-brand-primary text-body-sm font-medium hover:opacity-80 transition-opacity"
          >
            Mark all read
          </button>
        )}
      </div>
    </div>
  );
}

// ── List subcomponent ──
function PanelList({
  loading,
  notifications,
  onClose,
  onMarkedRead,
}: {
  loading: boolean;
  notifications: Array<{
    id: string;
    category: string;
    title: string;
    body: string | null;
    link: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
  onClose: () => void;
  onMarkedRead: (id: string) => void;
}) {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <BellOff className="w-10 h-10 text-text-muted mb-3" />
        <p className="text-body font-medium text-text-primary mb-1">
          No notifications yet
        </p>
        <p className="text-body-sm text-text-muted">
          You&apos;ll see updates from your society here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <ul className="divide-y divide-border-subtle">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={onClose}
            onMarkedRead={() => onMarkedRead(notification.id)}
          />
        ))}
      </ul>
    </div>
  );
}
