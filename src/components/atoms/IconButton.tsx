import { cn } from "@/utils";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import Spinner from "./Spinner";

export type IconButtonVariant =
  | "ghost" // Default — transparent, minimal
  | "solid" // Filled — for primary actions
  | "outline" // Bordered — secondary emphasis
  | "danger"; // Red — destructive

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> {
  /** Required accessible name (used for screen readers AND tooltip if enabled) */
  label: string;
  /** The icon element (recommend lucide-react icons) */
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Show native tooltip on hover (uses title attribute) */
  showTooltip?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: cn(
    "bg-transparent text-text-secondary",
    "hover:bg-bg-sunken hover:text-text-primary",
    "active:scale-[0.92]",
  ),
  solid: cn(
    "bg-brand-primary text-brand-primary-fg",
    "hover:bg-brand-primary-hover",
    "active:scale-[0.92]",
  ),
  outline: cn(
    "bg-transparent text-text-primary",
    "border border-border-default",
    "hover:bg-bg-sunken hover:border-border-strong",
    "active:scale-[0.92]",
  ),
  danger: cn(
    "bg-transparent text-danger",
    "hover:bg-danger-muted",
    "active:scale-[0.92]",
  ),
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "w-8 h-8", // 32px — for table rows, dense toolbars
  md: "w-10 h-10", // 40px — default
  lg: "w-12 h-12", // 48px — touch-friendly, mobile
};

// Icon sizes inside the button
const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "w-4 h-4", // 16px icon in 32px button
  md: "w-[18px] h-[18px]", // 18px icon in 40px button
  lg: "w-5 h-5", // 20px icon in 48px button
};

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      icon,
      variant = "ghost",
      size = "md",
      showTooltip = false,
      loading = false,
      asChild = false,
      disabled,
      className,
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const baseClasses = cn(
      // Layout
      "inline-flex items-center justify-center shrink-0",
      "rounded",
      // Motion
      "transition-all duration-[var(--duration)]",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
      "focus-visible:ring-offset-bg-base",
      // Disabled
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
      // Composed
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    // Wrap icon to enforce consistent sizing regardless of passed size
    const renderedIcon = loading ? (
      <Spinner size={size === "sm" ? "sm" : "md"} />
    ) : (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          iconSizeClasses[size],
        )}
      >
        {isValidElement(icon)
          ? cloneElement(icon as React.ReactElement<{ className?: string }>, {
              className: cn(
                "w-full h-full",
                (icon as React.ReactElement<{ className?: string }>).props
                  .className,
              ),
            })
          : icon}
      </span>
    );

    // asChild: clone single child element (e.g., Link) with button styles
    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string;
        "aria-label"?: string;
        title?: string;
        children?: ReactNode
      }>;
      return cloneElement(child, {
        className: cn(baseClasses, child.props.className),
        "aria-label": label,
        title: showTooltip ? label : undefined,
        ...(props as Record<string, unknown>),
        children: renderedIcon
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-label={label}
        aria-busy={loading || undefined}
        title={showTooltip ? label : undefined}
        className={baseClasses}
        {...props}
      >
        {renderedIcon}
      </button>
    );
  },
);

export default IconButton;
