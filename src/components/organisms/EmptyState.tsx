import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import Button, { ButtonProps } from "../atoms/Button";
import { cn } from "@/lib/utils/utils";

export type EmptyStateSize = "sm" | "md" | "lg";
export type EmptyStateTone = "neutral" | "success" | "info" | "warning";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  /** Pass-through for Button variants */
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  /** Render this action as a Link via asChild */
  asChild?: boolean;
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon to display (recommend lucide-react icons) */
  icon?: ReactNode;
  /** Replace icon with a custom illustration (priority over icon) */
  illustration?: ReactNode;
  /** Title — required */
  title: string;
  /** Optional description below title */
  description?: ReactNode;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action (less prominent) */
  secondaryAction?: EmptyStateAction;
  /** Visual scale */
  size?: EmptyStateSize;
  /** Color tone affects icon background tint */
  tone?: EmptyStateTone;
  /** Center horizontally and vertically in parent (use for full page) */
  fullPage?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const sizeConfig: Record<
  EmptyStateSize,
  {
    container: string;
    iconWrap: string;
    icon: string;
    title: string;
    description: string;
    gap: string;
    actionsGap: string;
  }
> = {
  sm: {
    container: "py-6",
    iconWrap: "w-12 h-12",
    icon: "w-6 h-6",
    title: "text-h4 text-text-primary",
    description: "text-body-sm text-text-secondary max-w-xs",
    gap: "space-y-3",
    actionsGap: "gap-2",
  },
  md: {
    container: "py-10",
    iconWrap: "w-16 h-16",
    icon: "w-8 h-8",
    title: "text-h3 text-text-primary",
    description: "text-body text-text-secondary max-w-sm",
    gap: "space-y-4",
    actionsGap: "gap-3",
  },
  lg: {
    container: "py-16",
    iconWrap: "w-20 h-20",
    icon: "w-10 h-10",
    title: "text-h2 text-text-primary",
    description: "text-body-lg text-text-secondary max-w-md",
    gap: "space-y-5",
    actionsGap: "gap-3",
  },
};

const toneClasses: Record<EmptyStateTone, string> = {
  neutral: "bg-bg-sunken text-text-muted",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
};

// ─────────────────────────────────────────────────────────────
//  Helper: render an action as button or link
// ─────────────────────────────────────────────────────────────

function renderAction(
  action: EmptyStateAction,
  defaultVariant: ButtonProps["variant"] = "primary",
) {
  const {
    label,
    onClick,
    href,
    variant = defaultVariant,
    icon,
    asChild,
  } = action;

  if (href || asChild) {
    return (
      <Button asChild variant={variant} icon={icon}>
        {href ? <a href={href}>{label}</a> : <span>{label}</span>}
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={onClick} icon={icon}>
      {label}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      icon,
      illustration,
      title,
      description,
      action,
      secondaryAction,
      size = "md",
      tone = "neutral",
      fullPage = false,
      className,
      ...props
    },
    ref,
  ) {
    const sz = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          sz.container,
          fullPage && "min-h-[60vh]",
          sz.gap,
          className,
        )}
        role="status"
        {...props}
      >
        {/* Illustration takes priority over icon */}
        {illustration ? (
          <div className="flex items-center justify-center">{illustration}</div>
        ) : icon ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-full shrink-0",
              sz.iconWrap,
              toneClasses[tone],
            )}
          >
            <span className={cn("inline-flex", sz.icon)}>{icon}</span>
          </div>
        ) : null}

        {/* Title + description */}
        <div className="space-y-1.5">
          <h3 className={sz.title}>{title}</h3>
          {description && (
            <p className={cn("mx-auto", sz.description)}>{description}</p>
          )}
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center",
              sz.actionsGap,
            )}
          >
            {action && renderAction(action, "primary")}
            {secondaryAction && renderAction(secondaryAction, "ghost")}
          </div>
        )}
      </div>
    );
  },
);

export default EmptyState;
