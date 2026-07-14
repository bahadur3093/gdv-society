import { cn } from "@/lib/utils/utils";
import { Shield } from "lucide-react";
import type { CommentWithAuthor } from "@/lib/helpdesk/types";

export default function CommentThread({
  comments,
  currentUserId,
}: {
  comments: CommentWithAuthor[];
  currentUserId: string;
}) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-body-sm text-text-muted italic">
        No replies yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => {
        const isMine = c.author.id === currentUserId;
        const isAdmin = c.isAdminComment;

        return (
          <div
            key={c.id}
            className={cn("flex", isMine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%]",
                isMine ? "items-end" : "items-start",
                "flex flex-col gap-1",
              )}
            >
              {/* Author line */}
              <div className="flex items-center gap-1.5 px-1 text-micro text-text-muted">
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-micro font-semibold">
                    <Shield className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
                <span>{c.author.name}</span>
                <span>·</span>
                <span>{formatTime(c.createdAt)}</span>
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "px-3.5 py-2.5 rounded-2xl text-body-sm whitespace-pre-wrap",
                  isMine
                    ? "bg-brand-primary/15 border border-brand-primary/25 text-text-primary rounded-tr-sm"
                    : "bg-bg-elevated border border-border-subtle text-text-primary rounded-tl-sm",
                )}
              >
                {c.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
