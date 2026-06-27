"use client";

import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/lib/notifications/use-unread-count";
import NotificationPanel from "./NotificationPanel";
import { cn } from "@/lib/utils/utils";

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const { unreadCount, refetch: refetchCount } = useUnreadCount();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) refetchCount();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center justify-center",
          "w-10 h-10 rounded-md",
          "text-text-secondary hover:text-text-primary",
          "hover:bg-bg-sunken",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
          open && "bg-bg-sunken text-text-primary",
        )}
      >
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute -top-1.5 -right-1.5",
                "min-w-4 h-4 px-1",
                "rounded-full bg-danger",
                "text-white text-[10px] font-bold leading-none",
                "flex items-center justify-center",
                "ring-2 ring-bg-base",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      <NotificationPanel
        open={open}
        onOpenChange={handleOpenChange}
        anchorRef={buttonRef}
      />
    </div>
  );
}
