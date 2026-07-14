"use client";

import { useTransition } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import { reopenRequest } from "@/lib/helpdesk/actions";

export default function ReopenButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Reopen this request?")) return;

    startTransition(async () => {
      const res = await reopenRequest(requestId);
      if (res.ok) {
        toast.success("Request reopened");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "w-full h-10 rounded-lg",
        "border border-border-default bg-bg-elevated",
        "text-body-sm font-medium text-text-primary",
        "inline-flex items-center justify-center gap-2",
        "hover:bg-bg-sunken",
        "disabled:opacity-50",
        "active:scale-[0.98] transition-transform",
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RotateCcw className="w-4 h-4" />
      )}
      Reopen Request
    </button>
  );
}
