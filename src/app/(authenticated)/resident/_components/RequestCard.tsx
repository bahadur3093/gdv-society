import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { REQUEST_TYPE_LABELS } from "@/lib/helpdesk/constants";
import type { ResidentRequest } from "@prisma/client";
import StatusPill from "./StatusPill";
import RequestTypeIcon from "./RequestTypeIcon";

type Props = {
  request: ResidentRequest & { _count?: { comments: number } };
  href: string;
};

export default function RequestCard({ request, href }: Props) {
  const commentCount = request._count?.comments ?? 0;

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border border-border-subtle bg-bg-elevated/60",
        "p-4 hover:bg-bg-elevated hover:border-border-default",
        "transition-all active:scale-[0.99]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg shrink-0 flex items-center justify-center",
            "bg-brand-primary/10 text-brand-primary",
          )}
        >
          <RequestTypeIcon type={request.requestType} className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-body-sm font-semibold text-text-primary truncate">
              {REQUEST_TYPE_LABELS[request.requestType]}
            </h3>
            <StatusPill status={request.status} />
          </div>

          <p className="text-body-sm text-text-muted line-clamp-2 mb-2">
            {request.description}
          </p>

          <div className="flex items-center gap-3 text-micro text-text-muted">
            <span>{formatDate(request.updatedAt)}</span>
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {commentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(d: Date) {
  const now = Date.now();
  const diff = now - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
