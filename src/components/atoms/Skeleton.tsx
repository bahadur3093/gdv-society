import { forwardRef, type HTMLAttributes } from "react";
import type { AvatarSize } from "./Avatar";
import { cn } from "@/lib/utils/utils";

// ─────────────────────────────────────────────────────────────
//  Base Skeleton
// ─────────────────────────────────────────────────────────────

export type SkeletonShape = "rect" | "circle" | "pill";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape of the skeleton */
  shape?: SkeletonShape;
  /** Width (CSS value or Tailwind class via className) */
  width?: string | number;
  /** Height (CSS value or Tailwind class via className) */
  height?: string | number;
  /** Disable shimmer (uses gentle pulse instead) */
  noShimmer?: boolean;
}

const shapeClasses: Record<SkeletonShape, string> = {
  rect: "rounded",
  circle: "rounded-full aspect-square",
  pill: "rounded-full",
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { shape = "rect", width, height, noShimmer, className, style, ...props },
  ref,
) {
  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined && {
      width: typeof width === "number" ? `${width}px` : width,
    }),
    ...(height !== undefined && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
  };

  return (
    <div
      ref={ref}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
      style={inlineStyle}
      className={cn(
        "relative overflow-hidden",
        "bg-bg-sunken",
        shapeClasses[shape],
        noShimmer
          ? "animate-pulse-soft"
          : cn(
              "bg-size-[200%_100%]",
              "animate-shimmer",
              "bg-linear-to-r",
              "from-bg-sunken via-bg-elevated to-bg-sunken",
            ),
        className,
      )}
      {...props}
    />
  );
});

export default Skeleton;

export interface SkeletonTextProps extends Omit<
  SkeletonProps,
  "shape" | "height"
> {
  size?: "sm" | "md" | "lg";
}

const textHeights: Record<NonNullable<SkeletonTextProps["size"]>, string> = {
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
};

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText({ size = "md", width, className, ...props }, ref) {
    return (
      <Skeleton
        ref={ref}
        shape="rect"
        width={width ?? "60%"}
        className={cn(textHeights[size], className)}
        {...props}
      />
    );
  },
);

// ─────────────────────────────────────────────────────────────
//  SkeletonHeading — larger text line (h1/h2)
// ─────────────────────────────────────────────────────────────

export interface SkeletonHeadingProps extends Omit<
  SkeletonProps,
  "shape" | "height"
> {
  size?: "h1" | "h2" | "h3" | "h4";
}

const headingHeights: Record<
  NonNullable<SkeletonHeadingProps["size"]>,
  string
> = {
  h1: "h-8", // 32px
  h2: "h-7", // 28px
  h3: "h-6", // 24px
  h4: "h-5", // 20px
};

export const SkeletonHeading = forwardRef<HTMLDivElement, SkeletonHeadingProps>(
  function SkeletonHeading({ size = "h2", width, className, ...props }, ref) {
    return (
      <Skeleton
        ref={ref}
        shape="rect"
        width={width ?? "40%"}
        className={cn(headingHeights[size], className)}
        {...props}
      />
    );
  },
);

// ─────────────────────────────────────────────────────────────
//  SkeletonParagraph — multiple lines with last line shorter
// ─────────────────────────────────────────────────────────────

export interface SkeletonParagraphProps extends Omit<
  SkeletonProps,
  "shape" | "width" | "height"
> {
  lines?: number;
  size?: "sm" | "md" | "lg";
}

export const SkeletonParagraph = forwardRef<
  HTMLDivElement,
  SkeletonParagraphProps
>(function SkeletonParagraph(
  { lines = 3, size = "md", className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const width = isLast ? "70%" : "100%";
        return <SkeletonText key={i} size={size} width={width} {...props} />;
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
//  SkeletonAvatar — matches Avatar component sizes
// ─────────────────────────────────────────────────────────────

export interface SkeletonAvatarProps extends Omit<
  SkeletonProps,
  "shape" | "width" | "height"
> {
  size?: AvatarSize;
  shape?: "circle" | "square";
}

const avatarSizes: Record<AvatarSize, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
  "2xl": "w-24 h-24",
};

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  function SkeletonAvatar(
    { size = "md", shape = "circle", className, ...props },
    ref,
  ) {
    return (
      <Skeleton
        ref={ref}
        shape={shape === "circle" ? "circle" : "rect"}
        className={cn(
          avatarSizes[size],
          shape === "square" && "rounded-md",
          className,
        )}
        {...props}
      />
    );
  },
);

// ─────────────────────────────────────────────────────────────
//  SkeletonButton — matches Button sizes
// ─────────────────────────────────────────────────────────────

export interface SkeletonButtonProps extends Omit<
  SkeletonProps,
  "shape" | "height"
> {
  size?: "sm" | "md" | "lg" | "xl";
  buttonShape?: "default" | "pill" | "square";
  fullWidth?: boolean;
}

const buttonHeights: Record<
  NonNullable<SkeletonButtonProps["size"]>,
  string
> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-14",
};

const buttonShapes: Record<
  NonNullable<SkeletonButtonProps["buttonShape"]>,
  string
> = {
  default: "rounded",
  pill: "rounded-full",
  square: "rounded aspect-square",
};

export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  function SkeletonButton(
    {
      size = "md",
      buttonShape = "default",
      fullWidth,
      width,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Skeleton
        ref={ref}
        shape="rect"
        width={fullWidth ? "100%" : (width ?? 100)}
        className={cn(
          buttonHeights[size],
          buttonShapes[buttonShape],
          className,
        )}
        {...props}
      />
    );
  },
);

// ─────────────────────────────────────────────────────────────
//  SkeletonCard — common card layout placeholder
// ─────────────────────────────────────────────────────────────

export interface SkeletonCardProps extends Omit<
  SkeletonProps,
  "shape" | "width" | "height"
> {
  showAvatar?: boolean;
  showActions?: boolean;
  lines?: number;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  function SkeletonCard(
    { showAvatar = true, showActions = false, lines = 2, className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "p-6 rounded-md bg-bg-elevated border border-border-subtle",
          "space-y-4",
          className,
        )}
      >
        {/* Header row */}
        <div className="flex items-center gap-3">
          {showAvatar && <SkeletonAvatar size="md" {...props} />}
          <div className="flex-1 space-y-2">
            <SkeletonHeading size="h4" width="50%" {...props} />
            <SkeletonText size="sm" width="30%" {...props} />
          </div>
        </div>

        {/* Body */}
        <SkeletonParagraph lines={lines} {...props} />

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <SkeletonButton size="md" width={100} {...props} />
            <SkeletonButton size="md" width={80} {...props} />
          </div>
        )}
      </div>
    );
  },
);
