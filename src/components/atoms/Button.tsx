// components/ui/Button.tsx

import { cn } from "@/utils";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import Spinner from "./Spinner";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary" // Solid violet — main CTAs
  | "secondary" // Subtle bg, border — secondary actions
  | "ghost" // Transparent — tertiary, in toolbars
  | "danger" // Red — destructive actions
  | "gradient"; // Brand gradient — HERO CTAs only

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonShape = "default" | "pill" | "square";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  /** Renders as the child element (e.g., Next.js Link) inheriting button styles */
  asChild?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-brand-primary text-brand-primary-fg",
    "hover:bg-brand-primary-hover",
    "active:scale-[0.98]",
  ),
  secondary: cn(
    "bg-bg-sunken text-text-primary",
    "border border-border-default",
    "hover:bg-bg-elevated hover:border-border-strong",
    "active:scale-[0.98]",
  ),
  ghost: cn(
    "bg-transparent text-text-primary",
    "hover:bg-bg-sunken",
    "active:scale-[0.98]",
  ),
  danger: cn(
    "bg-danger text-danger-fg",
    "hover:opacity-90",
    "active:scale-[0.98]",
  ),
  gradient: cn(
    "bg-[image:var(--gradient-brand)] text-white",
    "shadow-md hover:shadow-lg",
    "hover:opacity-95",
    "active:scale-[0.98]",
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-sm gap-1.5",
  md: "h-10 px-4 text-body gap-2",
  lg: "h-12 px-6 text-body-lg gap-2",
  xl: "h-14 px-8 text-h4 gap-2.5",
};

const shapeClasses: Record<ButtonShape, string> = {
  default: "rounded",
  pill: "rounded-full",
  square: "rounded aspect-square !px-0",
};

// Square shape needs explicit size since aspect-square + auto px doesn't size correctly
const squareSizeClasses: Record<ButtonSize, string> = {
  sm: "w-8",
  md: "w-10",
  lg: "w-12",
  xl: "w-14",
};

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    shape = "default",
    loading = false,
    loadingText,
    icon,
    iconPosition = "left",
    fullWidth = false,
    asChild = false,
    disabled,
    children,
    className,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  // Base classes shared across all variants
  const baseClasses = cn(
    // Layout
    "inline-flex items-center justify-center",
    "font-medium whitespace-nowrap select-none",
    // Motion
    "transition-all duration-[var(--duration)]",
    // Focus (theme-aware ring)
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-bg-base",
    // Disabled
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    // Composed
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    shape === "square" && squareSizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  // Render content (icon + children + spinner)
  const content = (
    <>
      {loading ? (
        <>
          <Spinner size={size === "sm" ? "sm" : "md"} />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="shrink-0">{icon}</span>
          )}
          {shape !== "square" && children}
          {icon && iconPosition === "right" && (
            <span className="shrink-0">{icon}</span>
          )}
          {shape === "square" && !icon && children}
        </>
      )}
    </>
  );

  // asChild: clone the single child element with button styles applied
  // Useful for: <Button asChild><Link href="/">Go</Link></Button>
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(baseClasses, child.props.className),
      ...(props as Record<string, unknown>),
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
