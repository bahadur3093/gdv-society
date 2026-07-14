import { Inbox, PlayCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Stats = {
  pending: number;
  inProgress: number;
  resolved: number;
  reopened: number;
  open: number;
  total: number;
};

const CARDS: Array<{
  key: keyof Stats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "warning" | "info" | "success" | "danger";
}> = [
  { key: "pending", label: "Pending", icon: Inbox, tone: "warning" },
  { key: "inProgress", label: "In Progress", icon: PlayCircle, tone: "info" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, tone: "success" },
  { key: "reopened", label: "Reopened", icon: RotateCcw, tone: "danger" },
];

const TONE_STYLES = {
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  danger: "bg-red-500/10 text-red-500 border-red-500/20",
} as const;

export default function AdminStatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        const value = stats[c.key];
        return (
          <div
            key={c.key}
            className={cn(
              "rounded-xl border p-4 flex items-center gap-3",
              "bg-bg-elevated/60 border-border-subtle",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border",
                TONE_STYLES[c.tone],
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-h3 font-bold text-text-primary leading-none">
                {value}
              </div>
              <div className="text-micro text-text-muted mt-1 uppercase tracking-wide">
                {c.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
