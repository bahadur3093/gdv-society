import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a colored dot prefix (good for status) */
  dot?: boolean;
  /** Leading icon */
  icon?: ReactNode;
  /** Show outlined style instead of filled */
  outline?: boolean;
  /** Show X button — fires onRemove when clicked */
  removable?: boolean;
  onRemove?: () => void;
}

// Filled variants — colored background with semantic colors
const filledVariantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-bg-sunken text-text-secondary border border-border-default",
  success: "bg-success-muted text-success border border-success-border",
  warning: "bg-warning-muted text-warning border border-warning-border",
  danger: "bg-danger-muted text-danger border border-danger-border",
  info: "bg-info-muted text-info border border-info-border",
  brand:
    "bg-brand-primary/15 text-brand-primary border border-brand-primary/30",
};

// Outline variants — no background, just colored border + text
const outlineVariantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-transparent text-text-secondary border border-border-default",
  success: "bg-transparent text-success border border-success-border",
  warning: "bg-transparent text-warning border border-warning-border",
  danger: "bg-transparent text-danger border border-danger-border",
  info: "bg-transparent text-info border border-info-border",
  brand: "bg-transparent text-brand-primary border border-brand-primary/30",
};

// Dot color (for dot prefix)
const dotColorClasses: Record<BadgeVariant, string> = {
  neutral: "bg-text-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  brand: "bg-brand-primary",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-micro gap-1",
  md: "h-6 px-2.5 text-body-sm gap-1.5",
  lg: "h-7 px-3 text-body gap-2",
};

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "neutral",
    size = "md",
    dot = false,
    icon,
    outline = false,
    removable = false,
    onRemove,
    className,
    children,
    ...props
  },
  ref,
) {
  const variantStyles = outline
    ? outlineVariantClasses[variant]
    : filledVariantClasses[variant];

  return (
    <span
      ref={ref}
      className={cn(
        // Layout
        "inline-flex items-center justify-center shrink-0",
        "font-medium whitespace-nowrap",
        // Shape
        "rounded-full",
        // Size
        sizeClasses[size],
        // Variant
        variantStyles,
        className,
      )}
      {...props}
    >
      {/* Dot prefix */}
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full shrink-0",
            dotSizeClasses[size],
            dotColorClasses[variant],
          )}
        />
      )}

      {/* Leading icon */}
      {icon && !dot && (
        <span
          className={cn(
            "shrink-0 inline-flex items-center",
            iconSizeClasses[size],
          )}
        >
          {icon}
        </span>
      )}

      {/* Label */}
      {children}

      {/* Remove button */}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "shrink-0 inline-flex items-center justify-center",
            "rounded-full",
            "hover:bg-current/20",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current",
            "transition-colors duration-[var(--duration-fast)]",
            // Match icon size
            iconSizeClasses[size],
          )}
          aria-label="Remove"
        >
          <X className="w-full h-full" />
        </button>
      )}
    </span>
  );
});

export default Badge;
