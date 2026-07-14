import Link from "next/link";
import { MessageSquare, Clock, User as UserIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { REQUEST_TYPE_LABELS } from "@/lib/helpdesk/constants";
import type { RequestWithAuthor } from "@/lib/helpdesk/types";
import StatusPill from "../../../resident/_components/StatusPill";
import RequestTypeIcon from "../../../resident/_components/RequestTypeIcon";

type RowRequest = RequestWithAuthor & { _count?: { comments: number } };

export default function AdminRequestRow({ request }: { request: RowRequest }) {
  const commentCount = request._count?.comments ?? 0;
  const href = "/admin/helpdesk/" + request.id;

  const needsAttention =
    request.status === "PENDING" ||
    request.status === "REOPENED" ||
    (request.lastResidentReplyAt !== null &&
      request.status === "IN_PROGRESS");

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-all active:scale-[0.99]",
        needsAttention && "border-brand-primary/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-brand-primary/10 text-brand-primary">
          <RequestTypeIcon type={request.requestType} className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-body-sm font-semibold text-text-primary truncate">
              {REQUEST_TYPE_LABELS[request.requestType]}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {needsAttention && (
                <span
                  className="w-2 h-2 rounded-full bg-brand-primary"
                  style={{ boxShadow: "0 0 8px rgba(139, 92, 246, 0.6)" }}
                  aria-label="Needs attention"
                />
              )}
              <StatusPill status={request.status} />
            </div>
          </div>

          <p className="text-body-sm text-text-muted line-clamp-2 mb-3">
            {request.description}
          </p>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 gap-3">
            <div className="flex items-center gap-3 text-micro text-text-muted min-w-0">
              <span className="inline-flex items-center gap-1 truncate">
                <UserIcon className="w-3 h-3 shrink-0" />
                <span className="truncate">{request.user.name}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Home className="w-3 h-3" />
                Plot {request.plotNumber}
              </span>
            </div>

            <div className="flex items-center gap-3 text-micro text-text-muted shrink-0">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(request.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(d: Date | string) {
  const now = Date.now();
  const diff = now - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return mins + "m ago";
  if (hours < 24) return hours + "h ago";
  if (days === 1) return "Yesterday";
  if (days < 7) return days + "d ago";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
