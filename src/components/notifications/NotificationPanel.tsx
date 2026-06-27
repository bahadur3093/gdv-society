"use client";

import { useEffect, useRef, type RefObject } from "react";
import { X, BellOff, Loader2, CheckCheck } from "lucide-react";
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

  // Fetch when opened
  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
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
  }, [open, onOpenChange, anchorRef]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

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

  if (!open) return null;

  return (
    <>
      {/* Backdrop only on mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40",
          "bg-black/30 backdrop-blur-sm",
          "sm:hidden",
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className={cn(
          // Mobile: full-height sheet from right
          "fixed inset-y-0 right-0 z-50 w-full max-w-md",
          // Desktop: dropdown anchored below button
          "sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[400px]",
          // Surface
          "bg-bg-elevated border border-border-default",
          "sm:rounded-xl shadow-2xl",
          "flex flex-col",
          "max-h-[100dvh] sm:max-h-[calc(100dvh-100px)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-body font-semibold text-text-primary">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary text-[11px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 px-2.5 h-8 rounded text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All read</span>
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-sunken sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <BellOff className="w-10 h-10 text-text-muted mb-3" />
              <p className="text-body font-medium text-text-primary mb-1">
                No notifications yet
              </p>
              <p className="text-body-sm text-text-muted">
                You&apos;ll see updates from your society here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => onOpenChange(false)}
                  onMarkedRead={() => handleItemMarkedRead(notification.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
