"use client";

import {
  forwardRef,
  useState,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import Badge, { BadgeProps } from "../atoms/Badge";
import { cn } from "@/lib/utils/utils";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type SectionSize = "sm" | "md" | "lg";
export type SectionDivider = "none" | "top" | "bottom" | "both";

export interface SectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Section title */
  title?: ReactNode;
  /** Description below title */
  description?: ReactNode;
  /** Icon shown left of title */
  icon?: ReactNode;
  /** Right-aligned action (button, link, etc.) */
  action?: ReactNode;
  /** Badge next to title (count, status) */
  badge?: ReactNode | (Omit<BadgeProps, "children"> & { label: string });
  /** Visual size of title */
  size?: SectionSize;
  /** Optional dividers around header */
  divider?: SectionDivider;
  /** Collapsible section with toggle */
  collapsible?: boolean;
  /** Initial open state (only with collapsible) */
  defaultOpen?: boolean;
  /** Controlled open state (use with onOpenChange) */
  open?: boolean;
  /** Fires when collapsed state changes */
  onOpenChange?: (open: boolean) => void;
  /** Children = section content */
  children?: ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const sizeConfig: Record<
  SectionSize,
  {
    title: string;
    description: string;
    iconWrap: string;
    iconSize: string;
    headerGap: string;
    contentGap: string;
    headerPadding: string;
  }
> = {
  sm: {
    title: "text-h4 text-text-primary",
    description: "text-body-sm text-text-secondary",
    iconWrap: "w-7 h-7",
    iconSize: "w-4 h-4",
    headerGap: "gap-2",
    contentGap: "space-y-3",
    headerPadding: "pb-3",
  },
  md: {
    title: "text-h3 text-text-primary",
    description: "text-body-sm text-text-secondary",
    iconWrap: "w-8 h-8",
    iconSize: "w-5 h-5",
    headerGap: "gap-3",
    contentGap: "space-y-4",
    headerPadding: "pb-4",
  },
  lg: {
    title: "text-h2 text-text-primary",
    description: "text-body text-text-secondary",
    iconWrap: "w-10 h-10",
    iconSize: "w-6 h-6",
    headerGap: "gap-4",
    contentGap: "space-y-5",
    headerPadding: "pb-5",
  },
};

const dividerClasses: Record<SectionDivider, string> = {
  none: "",
  top: "border-t border-border-subtle pt-6",
  bottom: "border-b border-border-subtle pb-6",
  both: "border-t border-b border-border-subtle py-6",
};

// ─────────────────────────────────────────────────────────────
//  Helper: render badge (object or ReactNode)
// ─────────────────────────────────────────────────────────────

function renderBadge(badge: SectionProps["badge"]) {
  if (!badge) return null;

  // If it's a badge config object (has `label` property)
  if (
    typeof badge === "object" &&
    badge !== null &&
    "label" in badge &&
    typeof badge.label === "string"
  ) {
    const { label, ...rest } = badge as { label: string } & Omit<
      BadgeProps,
      "children"
    >;
    return <Badge {...rest}>{label}</Badge>;
  }

  // Otherwise treat as ReactNode
  return badge as ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    title,
    description,
    icon,
    action,
    badge,
    size = "md",
    divider = "none",
    collapsible = false,
    defaultOpen = true,
    open: controlledOpen,
    onOpenChange,
    className,
    children,
    ...props
  },
  ref,
) {
  const id = useId();
  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;

  // Controlled vs uncontrolled open state
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const sz = sizeConfig[size];
  const hasHeader = !!(title || description || icon || action || badge);

  // Header content (title row)
  const headerContent = hasHeader && (
    <div
      className={cn(
        "flex items-start justify-between",
        sz.headerGap,
        sz.headerPadding,
        children && !collapsible && "pb-0", // override if no content gap needed
      )}
    >
      {/* Left side: icon + title + description */}
      <div className={cn("flex items-start flex-1 min-w-0", sz.headerGap)}>
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-md shrink-0",
              "bg-bg-sunken text-text-secondary",
              sz.iconWrap,
            )}
          >
            <span className={cn("inline-flex", sz.iconSize)}>{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Title row with optional badge */}
          {title && (
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={sz.title}>{title}</h2>
              {badge && renderBadge(badge)}
            </div>
          )}
          {description && (
            <p className={cn(sz.description, title && "mt-1")}>{description}</p>
          )}
        </div>
      </div>

      {/* Right side: action + optional collapse toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {action}
        {collapsible && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            id={headerId}
            className={cn(
              "inline-flex items-center justify-center rounded",
              "w-8 h-8 text-text-secondary",
              "hover:bg-bg-sunken hover:text-text-primary",
              "transition-colors duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              "focus-visible:ring-offset-bg-base",
            )}
            aria-label={isOpen ? "Collapse section" : "Expand section"}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-(--duration)",
                !isOpen && "-rotate-90",
              )}
            />
          </button>
        )}
      </div>
    </div>
  );

  // Content area (with collapse animation)
  const contentArea = children && (
    <div
      id={collapsible ? panelId : undefined}
      role={collapsible ? "region" : undefined}
      aria-labelledby={collapsible ? headerId : undefined}
      className={cn(
        "overflow-hidden",
        collapsible && "transition-all duration-(--duration-slow)",
        collapsible && !isOpen && "max-h-0 opacity-0",
        collapsible && isOpen && "max-h-1250 opacity-100", // large enough for most content
      )}
    >
      <div className={cn(sz.contentGap)}>{children}</div>
    </div>
  );

  return (
    <section
      ref={ref}
      className={cn(dividerClasses[divider], className)}
      {...props}
    >
      {headerContent}
      {contentArea}
    </section>
  );
});

export default Section;
