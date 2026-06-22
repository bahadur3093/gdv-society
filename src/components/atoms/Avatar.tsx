import {
  forwardRef,
  useState,
  type HTMLAttributes,
  cloneElement,
  isValidElement,
} from "react";
import { User } from "lucide-react";
import { cn, getInitials } from "@/lib/utils/utils";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square";
export type AvatarStatus = "online" | "offline" | "busy" | "away";
export type AvatarRing = "none" | "subtle" | "brand" | "success" | "danger";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL — if missing or fails to load, falls back to initials */
  src?: string | null;
  /** Name — used for initials fallback and alt text */
  name?: string | null;
  /** Override alt text (defaults to name) */
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Status indicator dot */
  status?: AvatarStatus;
  /** Ring border around avatar */
  ring?: AvatarRing;
  /** Generate deterministic background color from name */
  fallbackColor?: boolean;
  /** Render as Link or other element */
  asChild?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-body-sm",
  md: "w-10 h-10 text-body",
  lg: "w-12 h-12 text-body-lg",
  xl: "w-16 h-16 text-h3",
  "2xl": "w-24 h-24 text-h1",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-md",
};

const ringClasses: Record<AvatarRing, string> = {
  none: "",
  subtle: "ring-2 ring-border-default ring-offset-2 ring-offset-bg-base",
  brand: "ring-2 ring-brand-primary ring-offset-2 ring-offset-bg-base",
  success: "ring-2 ring-success ring-offset-2 ring-offset-bg-base",
  danger: "ring-2 ring-danger ring-offset-2 ring-offset-bg-base",
};

// Status dot styles
const statusColorClasses: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-text-muted",
  busy: "bg-danger",
  away: "bg-warning",
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: "w-1.5 h-1.5 ring-1",
  sm: "w-2 h-2 ring-2",
  md: "w-2.5 h-2.5 ring-2",
  lg: "w-3 h-3 ring-2",
  xl: "w-3.5 h-3.5 ring-[3px]",
  "2xl": "w-5 h-5 ring-4",
};

// Icon fallback size
const iconSizeClasses: Record<AvatarSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-12 h-12",
};

// ─────────────────────────────────────────────────────────────
//  Deterministic color palette (8 colors, picked by name hash)
// ─────────────────────────────────────────────────────────────

const FALLBACK_PALETTE = [
  // Each pair: [bg, text]
  ["bg-rose-500/20", "text-rose-600 dark:text-rose-400"],
  ["bg-orange-500/20", "text-orange-600 dark:text-orange-400"],
  ["bg-amber-500/20", "text-amber-600 dark:text-amber-400"],
  ["bg-emerald-500/20", "text-emerald-600 dark:text-emerald-400"],
  ["bg-teal-500/20", "text-teal-600 dark:text-teal-400"],
  ["bg-sky-500/20", "text-sky-600 dark:text-sky-400"],
  ["bg-violet-500/20", "text-violet-600 dark:text-violet-400"],
  ["bg-pink-500/20", "text-pink-600 dark:text-pink-400"],
] as const;

function getColorForName(name: string): { bg: string; text: string } {
  // Simple deterministic hash — same name → same color always
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % FALLBACK_PALETTE.length;
  const [bg, text] = FALLBACK_PALETTE[idx];
  return { bg, text };
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    name,
    alt,
    size = "md",
    shape = "circle",
    status,
    ring = "none",
    fallbackColor = true,
    asChild = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const [imageError, setImageError] = useState(false);
  const showImage = src && !imageError;
  const initials = getInitials(name);
  const hasName = name && name.trim().length > 0;

  // Pick fallback color from name
  const colors =
    fallbackColor && hasName
      ? getColorForName(name)
      : { bg: "bg-bg-sunken", text: "text-text-secondary" };

  const baseClasses = cn(
    // Layout
    "relative inline-flex items-center justify-center shrink-0",
    "select-none",
    "font-medium",
    // Size
    sizeClasses[size],
    // Shape
    shapeClasses[shape],
    // Ring
    ringClasses[ring],
    // Fallback color (when no image)
    !showImage && colors.bg,
    !showImage && colors.text,
    className,
  );

  // Status dot positioning depends on shape
  const statusDotClasses = cn(
    "absolute rounded-full",
    "ring-bg-base", // ring blends into page background
    statusSizeClasses[size],
    statusColorClasses[status ?? "offline"],
    // Position bottom-right for both shapes
    shape === "circle"
      ? "bottom-0 right-0"
      : "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
  );

  // The visual content (image | initials | icon)
  const content = (
    <>
      {showImage ? (
        <img
          src={src ?? ""}
          alt={alt ?? name ?? "User avatar"}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : hasName ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <User className={iconSizeClasses[size]} aria-hidden="true" />
      )}
    </>
  );

  // asChild path
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(baseClasses, child.props.className),
      ...(props as Record<string, unknown>),
    });
  }

  return (
    <span
      ref={ref}
      role="img"
      aria-label={alt ?? name ?? "User avatar"}
      className={baseClasses}
      {...props}
    >
      {content}
      {status && <span className={statusDotClasses} aria-hidden="true" />}
    </span>
  );
});

export default Avatar;
