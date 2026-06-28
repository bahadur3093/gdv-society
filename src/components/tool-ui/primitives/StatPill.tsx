import { cn } from "@/lib/utils/utils";

export default function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const tones = {
    default: "bg-bg-sunken text-text-primary",
    danger: "bg-red-500/10 text-red-500",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div
      className={cn("px-3 py-2 rounded-lg flex flex-col gap-0.5", tones[tone])}
    >
      <span className="text-micro uppercase opacity-70">{label}</span>
      <span className="text-body-sm font-semibold">{value}</span>
    </div>
  );
}
