"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  CreditCard,
  Wallet,
  HelpCircle,
  Droplets,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import DOMPurify from "dompurify";

interface Notification {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  notification: Notification;
  onClose: () => void;
  onMarkedRead: () => void;
}

const CATEGORY_ICONS: Record<string, typeof Bell> = {
  SYSTEM: Bell,
  BILLING: CreditCard,
  PAYMENT: Wallet,
  HELPDESK: HelpCircle,
  WATER: Droplets,
  ANNOUNCEMENT: Megaphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  SYSTEM: "bg-text-secondary/15 text-text-secondary",
  BILLING: "bg-warning/15 text-warning",
  PAYMENT: "bg-success/15 text-success",
  HELPDESK: "bg-info/15 text-info",
  WATER: "bg-sky-500/15 text-sky-500",
  ANNOUNCEMENT: "bg-brand-primary/15 text-brand-primary",
};

export default function NotificationItem({
  notification,
  onClose,
  onMarkedRead,
}: Props) {
  const router = useRouter();
  const Icon = CATEGORY_ICONS[notification.category] ?? Bell;
  const colorClass =
    CATEGORY_COLORS[notification.category] ?? CATEGORY_COLORS.SYSTEM;

  const handleClick = async () => {
    if (!notification.isRead) {
      onMarkedRead();
      markNotificationReadAction(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full flex items-start gap-3 p-3 sm:py-2.5 text-left",
          "hover:bg-bg-sunken/50 transition-colors",
          "focus-visible:outline-none focus-visible:bg-bg-sunken",
          !notification.isRead && "bg-brand-primary/5",
        )}
      >
        <div
          className={cn(
            "shrink-0 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
            colorClass,
          )}
        >
          <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p
              className={cn(
                "text-body-sm text-text-primary flex-1",
                !notification.isRead && "font-semibold",
              )}
            >
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-brand-primary" />
            )}
          </div>
          {notification.body && (
            <div className="text-body-sm text-text-muted line-clamp-2 mt-0.5">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(notification.body),
                }}
              />
            </div>
          )}
          <p className="text-micro text-text-muted mt-1">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
      </button>
    </li>
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
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}
