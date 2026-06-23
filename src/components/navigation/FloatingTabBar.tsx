"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import Badge from "../atoms/Badge";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface TabItem {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
  badge?: {
    label?: string;
    variant?: "danger" | "success" | "warning" | "info" | "brand";
    dot?: boolean;
  };
  isActive?: (pathname: string) => boolean;
}

export interface FloatingTabBarProps {
  items: TabItem[];
  showLabels?: boolean;
  /** Root path that should use exact-match for active state (e.g., '/resident') */
  rootHref?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────
//  Component — Always visible, no hide-on-scroll
// ─────────────────────────────────────────────────────────────

export default function FloatingTabBar({
  items,
  showLabels = false,
  rootHref = "/",
  className,
}: FloatingTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        // Position — always at bottom, never moves
        "fixed left-0 bottom-0 w-full",
        // Safe area for iOS home indicator
        "mb-[env(safe-area-inset-bottom,0px)]",
        // Z-index above page content, below modals
        "z-30",
        className,
      )}
    >
      {/* Glass surface */}
      <ul
        className={cn(
          "flex items-center justify-around gap-1",
          // Surface
          "bg-bg-elevated/85",
          "backdrop-blur-xl",
          "border border-border-subtle",
          "shadow-lg",
          // Padding
          "px-2 py-2",
        )}
      >
        {items.map((item) => {
          // Active state — exact match for root, child paths for everything else
          const isActive = item.isActive
            ? item.isActive(pathname)
            : pathname === item.href ||
              (item.href !== rootHref && pathname.startsWith(item.href + "/"));

          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "min-h-12 py-2 px-3",
                  "rounded-full",
                  isActive
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "text-text-secondary hover:text-text-primary",
                  "transition-colors duration-(--duration)",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-bg-base",
                )}
              >
                {/* Active indicator dot above icon */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -top-0.5 left-1/2 -translate-x-1/2",
                      "w-1 h-1 rounded-full",
                      "bg-(image:--gradient-brand)",
                    )}
                  />
                )}

                {/* Icon with optional badge */}
                <div className="relative">
                  <span className="inline-flex w-5 h-5">{item.icon}</span>

                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2">
                      {item.badge.dot ? (
                        <span
                          className={cn(
                            "block w-2 h-2 rounded-full",
                            "ring-2 ring-bg-elevated",
                            item.badge.variant === "success" && "bg-success",
                            item.badge.variant === "warning" && "bg-warning",
                            item.badge.variant === "info" && "bg-info",
                            item.badge.variant === "brand" &&
                              "bg-brand-primary",
                            (!item.badge.variant ||
                              item.badge.variant === "danger") &&
                              "bg-danger",
                          )}
                        />
                      ) : (
                        <Badge
                          size="sm"
                          variant={item.badge.variant ?? "danger"}
                          className="h-4! px-1! text-[10px]! min-w-4! leading-none! ring-2 ring-bg-elevated"
                        >
                          {item.badge.label}
                        </Badge>
                      )}
                    </span>
                  )}
                </div>

                {/* Label */}
                {(showLabels || isActive) && (
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      "whitespace-nowrap",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
