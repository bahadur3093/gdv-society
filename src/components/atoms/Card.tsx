// components/ui/Card.tsx

import { cn } from "@/lib/utils/utils";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type CardVariant =
  | "default"
  | "sunken"
  | "gradient"
  | "glass"
  | "outline";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "sm" | "md" | "lg" | "xl";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  /** Hover state + cursor pointer (for clickable cards) */
  interactive?: boolean;
  /** Stretch to fill parent height (useful in grids) */
  fullHeight?: boolean;
  /** Render as the child element (e.g., Link, button) */
  asChild?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default: cn("bg-bg-elevated border border-border-subtle", "shadow-sm"),
  sunken: cn("bg-bg-sunken border border-border-subtle"),
  gradient: cn(
    "bg-bg-elevated border border-border-subtle",
    "relative overflow-hidden",
    // Gradient mesh background
    "before:absolute before:inset-0 before:pointer-events-none",
    "before:bg-[image:var(--gradient-aurora)]",
    "before:opacity-100",
    "shadow-md",
  ),
  glass: cn(
    "bg-bg-elevated/70 border border-border-subtle",
    "backdrop-blur-xl",
    "shadow-md",
  ),
  outline: cn("bg-transparent border border-border-default"),
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const radiusClasses: Record<CardRadius, string> = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

const interactiveClasses = cn(
  "cursor-pointer",
  "transition-all duration-[var(--duration)]",
  "hover:shadow-md hover:border-border-default",
  "hover:-translate-y-0.5",
  "active:translate-y-0 active:shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  "focus-visible:ring-offset-bg-base",
);

// ─────────────────────────────────────────────────────────────
//  Card
// ─────────────────────────────────────────────────────────────

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    padding = "md",
    radius = "md",
    interactive = false,
    fullHeight = false,
    asChild = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const baseClasses = cn(
    "relative",
    variantClasses[variant],
    paddingClasses[padding],
    radiusClasses[radius],
    interactive && interactiveClasses,
    fullHeight && "h-full",
    className,
  );

  // For variant="gradient", wrap children to layer above the ::before pseudo
  const content =
    variant === "gradient" ? (
      <div className="relative z-10">{children}</div>
    ) : (
      children
    );

  // asChild: pass classes onto a child Link or button
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(baseClasses, child.props.className),
      ...(props as Record<string, unknown>),
    });
  }

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {content}
    </div>
  );
});

export default Card;

// ─────────────────────────────────────────────────────────────
//  CardHeader — title + description + optional action
// ─────────────────────────────────────────────────────────────

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Visual weight of the title */
  size?: "sm" | "md" | "lg";
}

const headerTitleSizes: Record<NonNullable<CardHeaderProps["size"]>, string> = {
  sm: "text-h4 text-text-primary",
  md: "text-h3 text-text-primary",
  lg: "text-h2 text-text-primary",
};

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    { title, description, action, size = "md", className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start justify-between gap-3",
          (title || description) && "mb-4",
          className,
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && <div className={headerTitleSizes[size]}>{title}</div>}
          {description && (
            <p className="text-body-sm text-text-secondary mt-1">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  },
);

// ─────────────────────────────────────────────────────────────
//  CardBody — main content (no internal padding, parent handles)
// ─────────────────────────────────────────────────────────────

export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardBody({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("text-body text-text-primary", className)}
      {...props}
    />
  );
});

// ─────────────────────────────────────────────────────────────
//  CardFooter — bottom area, divided from body
// ─────────────────────────────────────────────────────────────

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Add top border to visually separate from body */
  bordered?: boolean;
  /** Justify-end (most common — actions on the right) */
  justify?: "start" | "end" | "between" | "center";
}

const justifyClasses: Record<
  NonNullable<CardFooterProps["justify"]>,
  string
> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
  center: "justify-center",
};

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(
    { bordered = true, justify = "end", className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3",
          justifyClasses[justify],
          bordered && "pt-4 mt-4 border-t border-border-subtle",
          !bordered && "mt-4",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
