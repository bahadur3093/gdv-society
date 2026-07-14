import { AlertCircle } from "lucide-react";
import { REQUEST_TYPE_LABELS } from "@/lib/helpdesk/constants";
import type { RequestDetail as RD } from "@/lib/helpdesk/types";
import StatusPill from "./StatusPill";
import RequestTypeIcon from "./RequestTypeIcon";
import CommentThread from "./CommentThread";
import CommentComposer from "./CommentComposer";
import ReopenButton from "./ReopenButton";

export default function RequestDetail({
  request,
  currentUserId,
}: {
  request: RD;
  currentUserId: string;
}) {
  const isClosed =
    request.status === "RESOLVED" || request.status === "REJECTED";

  return (
    <div className="space-y-4">
      {/* Title strip */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <RequestTypeIcon type={request.requestType} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-h4 font-semibold text-text-primary">
            {REQUEST_TYPE_LABELS[request.requestType]}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-micro text-text-muted">
            <StatusPill status={request.status} />
            <span>Plot {request.plotNumber}</span>
            <span>·</span>
            <span>
              {new Date(request.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Description card */}
      <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4">
        <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold mb-1">
          Description
        </h3>
        <p className="text-body-sm text-text-primary whitespace-pre-wrap">
          {request.description}
        </p>

        {/* Type-specific data */}
        {request.newPlotSize && (
          <p className="mt-3 text-body-sm text-text-secondary">
            <span className="text-text-muted">Requested size:</span>{" "}
            <span className="font-medium text-text-primary">
              {request.newPlotSize} sqft
            </span>
          </p>
        )}
        {request.familyMemberName && (
          <div className="mt-3 space-y-1 text-body-sm">
            <p>
              <span className="text-text-muted">Family member:</span>{" "}
              <span className="text-text-primary font-medium">
                {request.familyMemberName}
              </span>
            </p>
            {request.familyMemberRelation && (
              <p>
                <span className="text-text-muted">Relation:</span>{" "}
                <span className="text-text-primary">
                  {request.familyMemberRelation}
                </span>
              </p>
            )}
            {request.familyMemberContact && (
              <p>
                <span className="text-text-muted">Contact:</span>{" "}
                <span className="text-text-primary">
                  {request.familyMemberContact}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Admin notes */}
      {request.adminNotes && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="text-body-sm font-semibold text-amber-500">
              Admin note
            </h3>
          </div>
          <p className="text-body-sm text-text-primary whitespace-pre-wrap">
            {request.adminNotes}
          </p>
        </div>
      )}

      {/* Comments */}
      <div>
        <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold mb-3 px-1">
          Conversation
        </h3>
        <CommentThread
          comments={request.comments}
          currentUserId={currentUserId}
        />
      </div>

      {/* Composer / Reopen */}
      <div className="space-y-3 pt-2">
        {isClosed && <ReopenButton requestId={request.id} />}
        <CommentComposer requestId={request.id} disabled={isClosed} />
      </div>
    </div>
  );
}
