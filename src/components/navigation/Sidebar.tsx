"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Badge from "../atoms/Badge";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface SidebarItem {
  /** Unique key for React */
  key: string;
  /** Destination URL */
  href: string;
  /** Icon (lucide recommended) */
  icon: ReactNode;
  /** Label shown when expanded */
  label: string;
  /** Optional badge (count, status) */
  badge?: {
    label?: string;
    variant?: "danger" | "success" | "warning" | "info" | "brand" | "neutral";
    dot?: boolean;
  };
  /** Custom active-match logic */
  isActive?: (pathname: string) => boolean;
  /** Disable the item */
  disabled?: boolean;
}

export interface SidebarSection {
  /** Unique key */
  key: string;
  /** Optional section title (uppercase, shown only when expanded) */
  title?: string;
  /** Items in this section */
  items: SidebarItem[];
}

export interface SidebarProps {
  /** Sections of items */
  sections: SidebarSection[];
  /** Logo / brand at top */
  brand?: ReactNode;
  /** Footer content (user menu, sign out, etc.) */
  footer?: ReactNode;
  /** Default collapsed state (only used on first mount) */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Fires when user toggles collapsed */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Allow hover to temporarily expand when collapsed */
  hoverExpand?: boolean;
  /** Width when expanded (px) */
  expandedWidth?: number;
  /** Width when collapsed (px) */
  collapsedWidth?: number;
  /** Storage key for persisting collapsed state */
  storageKey?: string;
  /** Additional className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
//  localStorage external store (collapse state persistence)
// ─────────────────────────────────────────────────────────────

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function makeStoredGetter(key: string) {
  return () => {
    try {
      const v = localStorage.getItem(key);
      return v === "true";
    } catch {
      return false;
    }
  };
}

function getServerSnapshot() {
  return false; // Default to expanded on SSR
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function Sidebar({
  sections,
  brand,
  footer,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  hoverExpand = true,
  expandedWidth = 240,
  collapsedWidth = 64,
  storageKey = "gdv-sidebar-collapsed",
  className,
}: SidebarProps) {
  const pathname = usePathname();

  // Persisted collapsed state via localStorage
  const persistedCollapsed = useSyncExternalStore(
    subscribeToStorage,
    makeStoredGetter(storageKey),
    getServerSnapshot,
  );

  // Controlled vs uncontrolled
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : persistedCollapsed;

  // Hover-expand state (only matters when collapsed)
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = !collapsed || (hoverExpand && isHovered);

  const setCollapsed = (next: boolean) => {
    if (!isControlled) {
      try {
        localStorage.setItem(storageKey, String(next));
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: storageKey,
            newValue: String(next),
          }),
        );
      } catch {
        // ignore
      }
    }
    onCollapsedChange?.(next);
  };

  return (
    <aside
      aria-label="Main navigation"
      onMouseEnter={() => collapsed && hoverExpand && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isExpanded ? expandedWidth : collapsedWidth,
      }}
      className={cn(
        "sticky top-0 h-screen shrink-0",
        "flex flex-col",
        "bg-bg-elevated",
        "border-r border-border-subtle",
        "transition-[width] duration-(--duration)",
        // Subtle shadow when hover-expanded over content
        collapsed && isHovered && "shadow-xl z-30",
        className,
      )}
    >
      {/* ─── Brand area ─── */}
      {brand && (
        <div
          className={cn(
            "flex items-center shrink-0",
            "h-16 border-b border-border-subtle",
            isExpanded ? "px-4" : "px-2 justify-center",
          )}
        >
          {brand}
        </div>
      )}

      {/* ─── Sections ─── */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
        <ul className="space-y-1">
          {sections?.length && sections.map((section, sectionIdx) => (
            <li key={section.key}>
              {/* Section title */}
              {section.title && (
                <div
                  className={cn(
                    "overflow-hidden transition-all",
                    isExpanded
                      ? "max-h-8 opacity-100 pt-3 pb-1"
                      : "max-h-0 opacity-0",
                    "px-4",
                  )}
                >
                  <span className="text-micro uppercase text-text-muted font-medium tracking-wider whitespace-nowrap">
                    {section.title}
                  </span>
                </div>
              )}

              {/* Divider when collapsed (replaces title) */}
              {!isExpanded && sectionIdx > 0 && (
                <div
                  className="mx-3 my-2 border-t border-border-subtle"
                  aria-hidden="true"
                />
              )}

              {/* Items */}
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <li key={item.key}>
                    <SidebarItemLink
                      item={item}
                      pathname={pathname}
                      isExpanded={isExpanded}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── Footer ─── */}
      {footer && (
        <div
          className={cn(
            "shrink-0 border-t border-border-subtle",
            isExpanded ? "p-3" : "p-2 flex justify-center",
          )}
        >
          {footer}
        </div>
      )}

      {/* ─── Collapse toggle ─── */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "shrink-0",
          "flex items-center justify-center",
          "h-10 mx-3 mb-3 rounded",
          "text-text-secondary hover:text-text-primary",
          "hover:bg-bg-sunken",
          "transition-colors duration-(--duration-fast)",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          "focus-visible:ring-offset-bg-base",
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
//  SidebarItemLink — individual nav item
// ─────────────────────────────────────────────────────────────

function SidebarItemLink({
  item,
  pathname,
  isExpanded,
}: {
  item: SidebarItem;
  pathname: string;
  isExpanded: boolean;
}) {
  const isActive = item.isActive
    ? item.isActive(pathname)
    : pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));

  const content = (
    <>
      {/* Active indicator: gradient line on left edge */}
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

      {/* Icon (with optional badge dot when collapsed) */}
      <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
        <span className="inline-flex w-5 h-5">{item.icon}</span>

        {/* When collapsed, show badge as a tiny dot */}
        {!isExpanded && item.badge && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-1 -right-1",
              "w-2 h-2 rounded-full",
              "ring-2 ring-bg-elevated",
              item.badge.variant === "success" && "bg-success",
              item.badge.variant === "warning" && "bg-warning",
              item.badge.variant === "info" && "bg-info",
              item.badge.variant === "brand" && "bg-brand-primary",
              (!item.badge.variant || item.badge.variant === "danger") &&
                "bg-danger",
            )}
          />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-body whitespace-nowrap",
          "overflow-hidden transition-all",
          isExpanded ? "opacity-100 max-w-xs ml-1" : "opacity-0 max-w-0 ml-0",
        )}
      >
        {item.label}
      </span>

      {/* Badge (when expanded) */}
      {isExpanded && item.badge && (
        <span
          className={cn(
            "shrink-0",
            "overflow-hidden transition-opacity",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        >
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
    </>
  );

  const linkClasses = cn(
    "relative",
    "flex items-center gap-2",
    "h-10 px-3 rounded",
    "transition-colors duration-[var(--duration-fast)]",
    // Active vs inactive
    isActive
      ? "bg-bg-sunken text-text-primary font-medium"
      : "text-text-secondary hover:text-text-primary hover:bg-bg-sunken",
    // Disabled
    item.disabled && "opacity-50 pointer-events-none",
    // Focus
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-bg-base",
  );

  if (item.disabled) {
    return (
      <div className={linkClasses} aria-disabled="true" title={item.label}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={linkClasses}
      aria-current={isActive ? "page" : undefined}
      title={!isExpanded ? item.label : undefined}
    >
      {content}
    </Link>
  );
}
