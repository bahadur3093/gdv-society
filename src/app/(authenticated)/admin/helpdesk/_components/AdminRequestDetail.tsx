import { AlertCircle, User as UserIcon, Home, Calendar } from "lucide-react";
import { REQUEST_TYPE_LABELS } from "@/lib/helpdesk/constants";
import type { RequestDetail as RD } from "@/lib/helpdesk/types";
import AdminActionsPanel from "./AdminActionsPanel";
import RequestTypeIcon from "@/app/(authenticated)/resident/_components/RequestTypeIcon";
import StatusPill from "@/app/(authenticated)/resident/_components/StatusPill";
import CommentThread from "@/app/(authenticated)/resident/_components/CommentThread";
import CommentComposer from "@/app/(authenticated)/resident/_components/CommentComposer";

export default function AdminRequestDetail({
  request,
  currentUserId,
}: {
  request: RD;
  currentUserId: string;
}) {
  const createdDate = new Date(request.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column — request + thread */}
      <div className="lg:col-span-2 space-y-4">
        {/* Title strip */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <RequestTypeIcon type={request.requestType} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-h3 font-semibold text-text-primary">
              {REQUEST_TYPE_LABELS[request.requestType]}
            </h2>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <StatusPill status={request.status} />
              {request.reopenCount > 0 && (
                <span className="text-micro text-red-500 font-semibold uppercase tracking-wide">
                  Reopened {request.reopenCount}x
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description card */}
        <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4">
          <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold mb-2">
            Description
          </h3>
          <p className="text-body-sm text-text-primary whitespace-pre-wrap">
            {request.description}
          </p>

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

        {/* Existing admin notes */}
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

        {/* Comment thread */}
        <div>
          <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold mb-3">
            Conversation
          </h3>
          <CommentThread
            comments={request.comments}
            currentUserId={currentUserId}
          />
        </div>

        {/* Composer */}
        <div className="pt-2">
          <CommentComposer requestId={request.id} />
        </div>
      </div>

      {/* Right column — resident info + actions */}
      <div className="space-y-4">
        {/* Resident card */}
        <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4 space-y-3">
          <h3 className="text-micro uppercase tracking-wider text-text-muted font-semibold">
            Resident
          </h3>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bg-sunken flex items-center justify-center text-text-muted">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-body-sm font-semibold text-text-primary truncate">
                {request.user.name}
              </div>
              <div className="text-micro text-text-muted truncate">
                {request.user.email}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle space-y-2 text-body-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <Home className="w-3.5 h-3.5" />
              <span>Plot {request.plotNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {createdDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <AdminActionsPanel
          requestId={request.id}
          currentStatus={request.status}
        />
      </div>
    </div>
  );
}
