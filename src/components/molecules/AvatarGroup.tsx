import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { AvatarSize } from "../atoms/Avatar";
import { cn } from "@/lib/utils/utils";

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

const spacingClasses: Record<
  NonNullable<AvatarGroupProps["spacing"]>,
  string
> = {
  tight: "-space-x-3",
  normal: "-space-x-2",
  loose: "-space-x-1",
};

export default function AvatarGroup({
  children,
  max,
  size,
  spacing = "normal",
  className,
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = max ? items.slice(0, max) : items;
  const overflow = max && items.length > max ? items.length - max : 0;

  return (
    <div
      className={cn("flex items-center", spacingClasses[spacing], className)}
    >
      {visible.map((child, i) =>
        cloneElement(
          child as React.ReactElement<{ ring?: string; size?: string }>,
          {
            ring: "subtle",
            ...(size && { size }),
            key: i,
          },
        ),
      )}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center shrink-0",
            "rounded-full bg-bg-sunken text-text-secondary border border-border-default",
            "ring-2 ring-bg-base",
            "font-medium select-none",
            // Match size if passed
            size === "xs" && "w-6 h-6 text-[10px]",
            size === "sm" && "w-8 h-8 text-body-sm",
            size === "md" && "w-10 h-10 text-body",
            size === "lg" && "w-12 h-12 text-body-lg",
            size === "xl" && "w-16 h-16 text-h3",
            size === "2xl" && "w-24 h-24 text-h1",
            !size && "w-10 h-10 text-body", // default
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
