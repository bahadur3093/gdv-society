import { cn } from "@/lib/utils/utils";

export default function ToolCard({
  title,
  icon,
  children,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-bg-elevated/60",
        "p-4 space-y-3",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-2 text-text-primary">
          {icon}
          <h3 className="text-body-sm font-semibold">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}