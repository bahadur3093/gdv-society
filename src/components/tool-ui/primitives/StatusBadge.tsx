import { cn } from "@/lib/utils/utils";

export default function StatusBadge({
  status,
}: {
  status: "PENDING" | "PARTIAL" | "PAID";
}) {
  const tones: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-500",
    PARTIAL: "bg-blue-500/10 text-blue-500",
    PAID: "bg-emerald-500/10 text-emerald-500",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md text-micro font-medium uppercase",
        tones[status],
      )}
    >
      {status}
    </span>
  );
}