import Link from "next/link";
import { Clock, XCircle, ChevronRight } from "lucide-react";
import type { PendingRequest } from "@/lib/billing/getResidentPendingRequests";
import { cn, formatCurrency } from "@/lib/utils/utils";

interface Props {
  requests: PendingRequest[];
}

export default function PendingRequestsBanner({ requests }: Props) {
  const pending = requests.filter((r) => r.status === "PENDING");
  const rejected = requests.filter((r) => r.status === "REJECTED");

  // Only show if there's something to show
  if (pending.length === 0 && rejected.length === 0) return null;

  const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-3">
      {/* Pending */}
      {pending.length > 0 && (
        <Link
          href={"/resident/pay"}
          className={cn(
            "group block p-4 rounded-md",
            "bg-warning-muted border border-warning-border",
            "hover:border-warning/40",
            "transition-colors duration-(--duration-fast)",
          )}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-warning">
                {pending.length} payment{pending.length === 1 ? "" : "s"} under
                review
              </p>
              <p className="text-body-sm text-warning/90 mt-0.5">
                {formatCurrency(pendingAmount)} pending admin verification
              </p>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-warning shrink-0",
                "transition-transform duration-(--duration-fast)",
                "group-hover:translate-x-0.5",
              )}
            />
          </div>
        </Link>
      )}

      {/* Rejected — most recent only on home, full list on /pay */}
      {rejected.length > 0 && (
        <Link
          href={"/resident/pay"}
          className={cn(
            "group block p-4 rounded-md",
            "bg-danger-muted border border-danger-border",
            "hover:border-danger/40",
            "transition-colors duration-(--duration-fast)",
          )}
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-danger shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-danger">
                Last payment request was rejected
              </p>
              <p className="text-body-sm text-danger/90 mt-0.5 truncate">
                {rejected[0].reviewNotes ?? "Tap to see details and resubmit"}
              </p>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-danger shrink-0",
                "transition-transform duration-(--duration-fast)",
                "group-hover:translate-x-0.5",
              )}
            />
          </div>
        </Link>
      )}
    </div>
  );
}
