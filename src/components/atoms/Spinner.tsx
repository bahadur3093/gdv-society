import { cn } from "@/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5 border-[1.5px]",
  md: "w-4 h-4 border-2",
  lg: "w-5 h-5 border-2",
};

export default function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full",
        "border-current border-r-transparent",
        "animate-spin",
        sizeClasses[size],
        className,
      )}
    />
  );
}
