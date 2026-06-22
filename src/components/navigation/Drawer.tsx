"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import type { SidebarSection, SidebarItem } from "./Sidebar";
import { cn } from "@/lib/utils/utils";
import IconButton from "../atoms/IconButton";
import Badge from "../atoms/Badge";

export interface DrawerProps {
  /** Open state (controlled) */
  open: boolean;
  /** Fires when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Sections of items (same shape as Sidebar) */
  sections: SidebarSection[];
  /** Logo / brand at top */
  brand?: ReactNode;
  /** Footer content (user menu, sign out, etc.) */
  footer?: ReactNode;
  /** Drawer width (default 320px) */
  width?: number;
  /** Auto-close drawer when route changes */
  autoCloseOnNavigate?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function Drawer({
  open,
  onOpenChange,
  sections,
  brand,
  footer,
  width = 320,
  autoCloseOnNavigate = true,
}: DrawerProps) {
  const pathname = usePathname();

  // Auto-close when route changes
  useEffect(() => {
    if (autoCloseOnNavigate && open) {
      onOpenChange(false);
    }
    // Only react to pathname changes — open/onOpenChange would loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange} direction="left">
      <VaulDrawer.Portal>
        {/* Backdrop */}
        <VaulDrawer.Overlay
          className={cn(
            "fixed inset-0 z-40",
            "bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-fade-in",
          )}
        />

        {/* Drawer content */}
        <VaulDrawer.Content
          aria-label="Main navigation"
          style={{ width: `${width}px` }}
          className={cn(
            "fixed top-0 left-0 bottom-0 z-50",
            "flex flex-col",
            "bg-bg-elevated",
            "border-r border-border-default",
            "shadow-xl",
            // Safe area for iOS notch
            "pt-[env(safe-area-inset-top)]",
            "pb-[env(safe-area-inset-bottom)]",
            "pl-[env(safe-area-inset-left)]",
            // Focus
            "focus:outline-none",
          )}
        >
          {/* Hidden title for accessibility */}
          <VaulDrawer.Title className="sr-only">
            Main navigation
          </VaulDrawer.Title>
          <VaulDrawer.Description className="sr-only">
            Navigate between admin sections
          </VaulDrawer.Description>

          {/* Brand area + close button */}
          <div className="flex items-center justify-between gap-2 h-16 px-4 border-b border-border-subtle shrink-0">
            <div className="flex-1 min-w-0 overflow-hidden">{brand}</div>
            <VaulDrawer.Close asChild>
              <IconButton
                label="Close menu"
                icon={<X />}
                size="sm"
                variant="ghost"
              />
            </VaulDrawer.Close>
          </div>

          {/* Sections */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.key}>
                  {section.title && (
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-micro uppercase text-text-muted font-medium tracking-wider">
                        {section.title}
                      </span>
                    </div>
                  )}
                  <ul className="space-y-0.5 px-2">
                    {section.items.map((item) => (
                      <li key={item.key}>
                        <DrawerItemLink item={item} pathname={pathname} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 p-3 border-t border-border-subtle">
              {footer}
            </div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

// ─────────────────────────────────────────────────────────────
//  DrawerItemLink — individual nav item
// ─────────────────────────────────────────────────────────────

function DrawerItemLink({
  item,
  pathname,
}: {
  item: SidebarItem;
  pathname: string;
}) {
  const isActive = item.isActive
    ? item.isActive(pathname)
    : pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));

  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3",
          "h-11 px-3 rounded",
          "text-text-secondary opacity-50",
          "pointer-events-none",
        )}
        aria-disabled="true"
      >
        <span className="inline-flex w-5 h-5 shrink-0">{item.icon}</span>
        <span className="flex-1 text-body whitespace-nowrap">{item.label}</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative",
        "flex items-center gap-3",
        "h-11 px-3 rounded",
        "transition-colors duration-(--duration-fast)",
        isActive
          ? "bg-bg-sunken text-text-primary font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-sunken",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
        "focus-visible:ring-offset-bg-base",
      )}
    >
      {/* Active gradient line on left edge */}
      {isActive && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1.5 bottom-1.5 w-0.75",
            "rounded-r-full",
            "bg-(image:--gradient-brand)",
          )}
        />
      )}

      <span className="inline-flex w-5 h-5 shrink-0">{item.icon}</span>
      <span className="flex-1 text-body whitespace-nowrap">{item.label}</span>

      {item.badge && (
        <span className="shrink-0">
          {item.badge.dot ? (
            <span
              aria-hidden="true"
              className={cn(
                "block w-2 h-2 rounded-full",
                item.badge.variant === "success" && "bg-success",
                item.badge.variant === "warning" && "bg-warning",
                item.badge.variant === "info" && "bg-info",
                item.badge.variant === "brand" && "bg-brand-primary",
                (!item.badge.variant || item.badge.variant === "danger") &&
                  "bg-danger",
              )}
            />
          ) : (
            <Badge size="sm" variant={item.badge.variant ?? "danger"}>
              {item.badge.label}
            </Badge>
          )}
        </span>
      )}
    </Link>
  );
}
