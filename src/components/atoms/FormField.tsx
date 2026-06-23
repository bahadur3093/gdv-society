import { cn } from "@/lib/utils/utils";
import { cloneElement, isValidElement, useId, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface FormFieldProps {
  /** The label text */
  label: string;
  /** Required indicator — adds red asterisk */
  required?: boolean;
  /** Helper text shown below the field (overridden by errorText if present) */
  helperText?: ReactNode;
  /** Error message — shows in red, also passes error state to child input */
  errorText?: string;
  /** Success message — shows in green, also passes success state */
  successText?: string;
  /** Hide the label visually (but keep for screen readers) */
  hideLabel?: boolean;
  /** Optional content shown on the right side of the label (e.g., "Forgot password?") */
  labelAction?: ReactNode;
  /** Custom className for the wrapper */
  className?: string;
  /** The form control element (Input, Select, etc.) */
  children: ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function FormField({
  label,
  required,
  helperText,
  errorText,
  successText,
  hideLabel = false,
  labelAction,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const successId = `${id}-success`;

  // Determine state from props
  const hasError = !!errorText;
  const hasSuccess = !!successText && !hasError;
  const state = hasError ? "error" : hasSuccess ? "success" : "default";

  // Determine which message ID to link via aria-describedby
  const describedBy = hasError
    ? errorId
    : hasSuccess
      ? successId
      : helperText
        ? helperId
        : undefined;

  // Inject id, aria props, and state into the child input
  const injectedChild = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{
          id?: string;
          state?: "default" | "error" | "success";
          "aria-describedby"?: string;
          "aria-invalid"?: boolean;
          "aria-required"?: boolean;
        }>,
        {
          id,
          state,
          "aria-describedby": describedBy,
          "aria-invalid": hasError || undefined,
          "aria-required": required || undefined,
        },
      )
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className={cn(
            "block text-body-sm font-medium text-text-primary",
            hideLabel && "sr-only",
          )}
        >
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAction && !hideLabel && (
          <div className="text-body-sm">{labelAction}</div>
        )}
      </div>

      {/* The input/select/etc. */}
      {injectedChild}

      {/* Helper / error / success text */}
      {hasError && (
        <p id={errorId} role="alert" className="text-body-sm text-danger">
          {errorText}
        </p>
      )}
      {hasSuccess && (
        <p id={successId} className="text-body-sm text-success">
          {successText}
        </p>
      )}
      {!hasError && !hasSuccess && helperText && (
        <p id={helperId} className="text-body-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
