"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import Badge from "../atoms/Badge";

export interface TabItem {
  /** Unique key for React */
  key: string;
  /** Destination URL */
  href: string;
  /** Icon (lucide recommended) */
  icon: ReactNode;
  /** Label shown when active (or always if showLabels) */
  label: string;
  /** Badge config (count, dot, status) */
  badge?: {
    label?: string;
    variant?: "danger" | "success" | "warning" | "info" | "brand";
    dot?: boolean;
  };
  /** Custom active-match logic. Default: pathname starts with href */
  isActive?: (pathname: string) => boolean;
}

export interface FloatingTabBarProps {
  /** Tab items (2-5 recommended) */
  items: TabItem[];
  /** Always show labels (vs only on active tab) */
  showLabels?: boolean;
  /** Hide bar when scrolling down, show when scrolling up */
  hideOnScroll?: boolean;
  /** Additional className for the bar */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function FloatingTabBar({
  items,
  showLabels = false,
  hideOnScroll = true,
  className,
}: FloatingTabBarProps) {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  // Hide-on-scroll behavior
  useEffect(() => {
    if (!hideOnScroll) return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const goingDown = currentY > lastY;
        // Only hide if scrolled at least 50px and going down
        if (currentY > 50 && goingDown) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        // Position — floats above content
        "fixed left-1/2 -translate-x-1/2",
        "bottom-4",
        // Safe area
        "mb-[env(safe-area-inset-bottom,0px)]",
        // Sizing
        "w-[calc(100vw-2rem)]",
        "max-w-120",
        // Z-index above page content, below modals
        "z-30",
        // Hide animation
        "transition-transform duration-(--duration-slow)",
        isHidden && "translate-y-[calc(100%+2rem)]",
        // Custom override
        className,
      )}
    >
      {/* Glass surface */}
      <ul
        className={cn(
          "flex items-center justify-around gap-1",
          // Surface
          "bg-bg-elevated/70",
          "backdrop-blur-xl",
          "border border-border-subtle",
          "rounded-full",
          "shadow-lg",
          // Padding
          "px-2 py-2",
        )}
      >
        {items.map((item) => {
          const isActive = item.isActive
            ? item.isActive(pathname)
            : pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

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
                  "transition-all duration-(--duration)",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-bg-base",
                )}
              >
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

                {/* Label — only on active or always if showLabels */}
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
