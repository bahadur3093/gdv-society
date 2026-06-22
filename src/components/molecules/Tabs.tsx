"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Badge from "../atoms/Badge";

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: {
    label: string;
    variant?: "danger" | "warning" | "success" | "info" | "brand" | "neutral";
  };
  disabled?: boolean;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: "underline" | "pill" | "segmented";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 px-3 text-body-sm",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-5 text-body",
};

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    onChange,
    variant = "underline",
    fullWidth = false,
    size = "md",
    className,
    ...props
  },
  ref,
) {
  // ─── Underline variant — with smart scroll affordance ───
  if (variant === "underline") {
    return (
      <UnderlineTabs
        ref={ref}
        items={items}
        value={value}
        onChange={onChange}
        size={size}
        fullWidth={fullWidth}
        className={className}
        {...props}
      />
    );
  }

  // ─── Pill variant (unchanged) ───
  if (variant === "pill") {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          "inline-flex items-center gap-1 p-1",
          "rounded-full bg-bg-sunken border border-border-subtle",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {items.map((item) => {
          const isActive = value === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              onClick={() => !item.disabled && onChange(item.key)}
              className={cn(
                "relative inline-flex items-center gap-2 shrink-0",
                "rounded-full font-medium",
                "transition-all duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                "focus-visible:ring-offset-bg-base",
                sizeClasses[size],
                fullWidth && "flex-1 justify-center",
                isActive
                  ? "bg-bg-elevated text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
                item.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {item.icon && (
                <span className="inline-flex w-4 h-4 shrink-0">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
              {item.badge && (
                <Badge size="sm" variant={item.badge.variant ?? "neutral"}>
                  {item.badge.label}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ─── Segmented variant (unchanged) ───
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex items-center p-1 rounded-md",
        "bg-bg-sunken border border-border-subtle",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.key)}
            className={cn(
              "inline-flex items-center gap-2 shrink-0 rounded",
              "font-medium",
              "transition-all duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary",
              sizeClasses[size],
              fullWidth && "flex-1 justify-center",
              isActive
                ? "bg-bg-elevated text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
              item.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {item.icon && (
              <span className="inline-flex w-4 h-4 shrink-0">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default Tabs;

// ─────────────────────────────────────────────────────────────
//  Underline variant — with scroll affordance
// ─────────────────────────────────────────────────────────────

const UnderlineTabs = forwardRef<HTMLDivElement, TabsProps>(
  function UnderlineTabs(
    { items, value, onChange, size = "md", fullWidth, className, ...props },
    ref,
  ) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Update scroll state (visibility of arrows + fades)
    const updateScrollState = useCallback(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }, []);

    // Initial check + on resize
    useEffect(() => {
      updateScrollState();
      const el = scrollerRef.current;
      if (!el) return;

      const handleScroll = () => updateScrollState();
      const resizeObserver = new ResizeObserver(() => updateScrollState());

      el.addEventListener("scroll", handleScroll, { passive: true });
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
      };
    }, [updateScrollState]);

    // Auto-scroll active tab into view when value changes
    useEffect(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const activeTab = el.querySelector<HTMLButtonElement>(
        `[data-tab-key="${value}"]`,
      );
      if (!activeTab) return;

      const { left, right } = activeTab.getBoundingClientRect();
      const { left: scrollerLeft, right: scrollerRight } =
        el.getBoundingClientRect();

      // Scroll into view if not fully visible
      if (left < scrollerLeft) {
        el.scrollBy({
          left: left - scrollerLeft - 40,
          behavior: "smooth",
        });
      } else if (right > scrollerRight) {
        el.scrollBy({
          left: right - scrollerRight + 40,
          behavior: "smooth",
        });
      }
    }, [value]);

    const scrollBy = (delta: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: delta, behavior: "smooth" });
    };

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Scrollable container */}
        <div
          ref={scrollerRef}
          role="tablist"
          className={cn(
            "relative flex items-center gap-1",
            "border-b border-border-subtle",
            // Hide scrollbar but keep scrolling functional
            "overflow-x-auto",
            "scrollbar-hide",
            "[-ms-overflow-style:none]",
            "scrollbar-none",
            "[&::-webkit-scrollbar]:hidden",
            fullWidth && "w-full",
          )}
        >
          {items.map((item) => {
            const isActive = value === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                data-tab-key={item.key}
                aria-selected={isActive}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                onClick={() => !item.disabled && onChange(item.key)}
                className={cn(
                  "relative inline-flex items-center gap-2 shrink-0",
                  "font-medium whitespace-nowrap",
                  "transition-colors duration-(--duration-fast)",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-bg-base rounded-md",
                  sizeClasses[size],
                  fullWidth && "flex-1 justify-center",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                  item.disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {item.icon && (
                  <span className="inline-flex w-4 h-4 shrink-0">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge size="sm" variant={item.badge.variant ?? "neutral"}>
                    {item.badge.label}
                  </Badge>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-px left-2 right-2 h-0.5",
                      "bg-brand-primary rounded-full",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Left fade + arrow — only when can scroll left */}
        {canScrollLeft && (
          <>
            <div
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-0 bottom-0 w-12 pointer-events-none",
                "bg-linear-to-r from-bg-base via-bg-base/80 to-transparent",
                "z-10",
              )}
            />
            <button
              type="button"
              onClick={() => scrollBy(-200)}
              aria-label="Scroll tabs left"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-20",
                "inline-flex items-center justify-center",
                "w-8 h-8 rounded-full",
                "bg-bg-elevated border border-border-default shadow-sm",
                "text-text-secondary hover:text-text-primary",
                "hover:bg-bg-sunken",
                "transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                "focus-visible:ring-offset-bg-base",
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Right fade + arrow — only when can scroll right */}
        {canScrollRight && (
          <>
            <div
              aria-hidden="true"
              className={cn(
                "absolute right-0 top-0 bottom-0 w-12 pointer-events-none",
                "bg-linear-to-l from-bg-base via-bg-base/80 to-transparent",
                "z-10",
              )}
            />
            <button
              type="button"
              onClick={() => scrollBy(200)}
              aria-label="Scroll tabs right"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-20",
                "inline-flex items-center justify-center",
                "w-8 h-8 rounded-full",
                "bg-bg-elevated border border-border-default shadow-sm",
                "text-text-secondary hover:text-text-primary",
                "hover:bg-bg-sunken",
                "transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                "focus-visible:ring-offset-bg-base",
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  },
);
