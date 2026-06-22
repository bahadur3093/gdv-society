import { cn } from "@/lib/utils/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type InputSize = "sm" | "md" | "lg";
export type InputState = "default" | "error" | "success";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> {
  inputSize?: InputSize;
  state?: InputState;
  /** Icon shown on the left side */
  leadingIcon?: ReactNode;
  /** Icon shown on the right side (e.g., calendar, eye for password) */
  trailingIcon?: ReactNode;
  /** Text prefix (e.g., "₹", "@") — non-interactive */
  prefix?: string;
  /** Text suffix (e.g., "sqft", "%") — non-interactive */
  suffix?: string;
  /** Full width (default true) */
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 text-body-sm",
  md: "h-10 text-body",
  lg: "h-12 text-body-lg",
};

const paddingClasses: Record<
  InputSize,
  { xLeft: string; xRight: string; iconLeft: string; iconRight: string }
> = {
  sm: {
    xLeft: "pl-2.5",
    xRight: "pr-2.5",
    iconLeft: "pl-8",
    iconRight: "pr-8",
  },
  md: { xLeft: "pl-3", xRight: "pr-3", iconLeft: "pl-10", iconRight: "pr-10" },
  lg: { xLeft: "pl-4", xRight: "pr-4", iconLeft: "pl-12", iconRight: "pr-12" },
};

const iconPositionClasses: Record<
  InputSize,
  { left: string; right: string; size: string }
> = {
  sm: { left: "left-2", right: "right-2", size: "w-3.5 h-3.5" },
  md: { left: "left-3", right: "right-3", size: "w-4 h-4" },
  lg: { left: "left-3.5", right: "right-3.5", size: "w-[18px] h-[18px]" },
};

const stateClasses: Record<InputState, string> = {
  default: cn(
    "border-border-default",
    "focus-within:border-brand-primary",
    "focus-within:ring-2 focus-within:ring-brand-primary/30",
    "focus-within:ring-offset-2 focus-within:ring-offset-bg-base",
  ),
  error: cn(
    "border-danger",
    "focus-within:border-danger",
    "focus-within:ring-2 focus-within:ring-danger/30",
    "focus-within:ring-offset-2 focus-within:ring-offset-bg-base",
  ),
  success: cn(
    "border-success",
    "focus-within:border-success",
    "focus-within:ring-2 focus-within:ring-success/30",
    "focus-within:ring-offset-2 focus-within:ring-offset-bg-base",
  ),
};

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    inputSize = "md",
    state = "default",
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    fullWidth = true,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const padding = paddingClasses[inputSize];
  const iconPos = iconPositionClasses[inputSize];

  // Determine left/right padding based on what's present
  const hasLeftIcon = !!leadingIcon;
  const hasLeftPrefix = !!prefix;
  const hasRightIcon = !!trailingIcon;
  const hasRightSuffix = !!suffix;

  return (
    <div
      className={cn(
        // Layout
        "relative inline-flex items-center",
        fullWidth && "w-full",
        // Surface
        "bg-bg-elevated rounded",
        "border",
        // Motion
        "transition-all duration-(--duration)",
        // State
        stateClasses[state],
        disabled && "opacity-50 cursor-not-allowed bg-bg-sunken",
        className,
      )}
    >
      {/* Leading icon */}
      {leadingIcon && (
        <span
          className={cn(
            "absolute pointer-events-none flex items-center justify-center",
            "text-text-muted",
            iconPos.left,
            iconPos.size,
            disabled && "opacity-50",
          )}
        >
          {leadingIcon}
        </span>
      )}

      {/* Prefix text */}
      {prefix && !leadingIcon && (
        <span
          className={cn(
            "pl-3 text-text-secondary font-medium pointer-events-none",
            inputSize === "sm" && "text-body-sm",
            inputSize === "md" && "text-body",
            inputSize === "lg" && "text-body-lg",
          )}
        >
          {prefix}
        </span>
      )}

      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex-1 bg-transparent outline-none",
          "text-text-primary placeholder:text-text-muted",
          "outline-none focus:outline-none focus-visible:outline-none",
          sizeClasses[inputSize],
          hasLeftIcon
            ? padding.iconLeft
            : hasLeftPrefix
              ? "pl-2"
              : padding.xLeft,
          hasRightIcon
            ? padding.iconRight
            : hasRightSuffix
              ? "pr-2"
              : padding.xRight,
          disabled && "cursor-not-allowed",
          "[&::-webkit-inner-spin-button]:appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none",
          "[type=number]:[appearance:textfield]",
        )}
        {...props}
      />

      {suffix && !trailingIcon && (
        <span
          className={cn(
            "pr-3 text-text-muted pointer-events-none",
            inputSize === "sm" && "text-body-sm",
            inputSize === "md" && "text-body",
            inputSize === "lg" && "text-body-lg",
          )}
        >
          {suffix}
        </span>
      )}

      {/* Trailing icon */}
      {trailingIcon && (
        <span
          className={cn(
            "absolute flex items-center justify-center",
            "text-text-muted",
            iconPos.right,
            iconPos.size,
            disabled && "opacity-50",
          )}
        >
          {trailingIcon}
        </span>
      )}
    </div>
  );
});

export default Input;
