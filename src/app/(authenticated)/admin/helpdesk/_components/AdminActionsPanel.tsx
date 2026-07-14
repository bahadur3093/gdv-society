"use client";

import { useState, useTransition } from "react";
import { PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RequestStatus } from "@prisma/client";
import { cn } from "@/lib/utils/utils";
import { updateRequestStatus } from "@/lib/helpdesk/actions";
import { ADMIN_STATUS_TRANSITIONS } from "@/lib/helpdesk/constants";

type Action = "IN_PROGRESS" | "RESOLVED" | "REJECTED";

const ACTION_META: Record<
  Action,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: "info" | "success" | "danger";
    requiresNote: boolean;
  }
> = {
  IN_PROGRESS: {
    label: "Start Work",
    icon: PlayCircle,
    tone: "info",
    requiresNote: false,
  },
  RESOLVED: {
    label: "Mark Resolved",
    icon: CheckCircle2,
    tone: "success",
    requiresNote: false,
  },
  REJECTED: {
    label: "Reject",
    icon: XCircle,
    tone: "danger",
    requiresNote: true,
  },
};

const TONE_CLASSES = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/15",
  success:
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/15",
  danger: "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/15",
} as const;

export default function AdminActionsPanel({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: RequestStatus;
}) {
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [isPending, startTransition] = useTransition();

  const allowed = ADMIN_STATUS_TRANSITIONS[currentStatus] as Action[];

  if (allowed.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-4">
        <p className="text-body-sm text-text-muted text-center italic">
          No further admin actions available. Resident may reopen if needed.
        </p>
      </div>
    );
  }

  const handleClick = (action: Action) => {
    const meta = ACTION_META[action];

    if (meta.requiresNote && !note.trim()) {
      toast.error("Please add a note explaining the rejection.");
      return;
    }

    if (!confirm(`Confirm: ${meta.label}?`)) return;

    setPendingAction(action);
    startTransition(async () => {
      const res = await updateRequestStatus({
        requestId,
        status: action,
        adminNotes: note.trim() || undefined,
      });

      if (res.ok) {
        toast.success(meta.label + " ✓");
        setNote("");
      } else {
        toast.error(res.error);
      }
      setPendingAction(null);
    });
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4 space-y-3">
      <div>
        <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold mb-1">
          Admin Actions
        </h3>
        <p className="text-body-sm text-text-muted">
          Update status or add internal notes visible to the resident.
        </p>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (required for rejection)..."
        rows={3}
        disabled={isPending}
        className={cn(
          "w-full px-3 py-2.5 rounded-lg resize-none",
          "bg-bg-sunken border border-border-default",
          "text-body-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          "disabled:opacity-50",
        )}
      />

      <div className="flex flex-wrap gap-2">
        {allowed.map((action) => {
          const meta = ACTION_META[action];
          const Icon = meta.icon;
          const isThisPending = pendingAction === action && isPending;

          return (
            <button
              key={action}
              type="button"
              onClick={() => handleClick(action)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
                "text-body-sm font-medium border transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "active:scale-95 transition-transform",
                TONE_CLASSES[meta.tone],
              )}
            >
              {isThisPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
