import { cn } from "@/lib/utils/utils";
import type { RequestStatus } from "@prisma/client";
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
} from "@/lib/helpdesk/constants";

const TONE_CLASSES = {
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  danger: "bg-red-500/10 text-red-500 border-red-500/20",
  muted: "bg-bg-sunken text-text-muted border-border-subtle",
} as const;

export default function StatusPill({ status }: { status: RequestStatus }) {
  const tone = REQUEST_STATUS_TONES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border",
        "text-micro font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
      )}
    >
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
