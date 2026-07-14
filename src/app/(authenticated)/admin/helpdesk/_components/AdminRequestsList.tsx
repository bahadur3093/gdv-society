import { Inbox } from "lucide-react";
import type { RequestWithAuthor } from "@/lib/helpdesk/types";
import AdminRequestRow from "./AdminRequestRow";

type Row = RequestWithAuthor & { _count?: { comments: number } };

export default function AdminRequestsList({
  requests,
  hasFilter,
}: {
  requests: Row[];
  hasFilter: boolean;
}) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-bg-sunken flex items-center justify-center">
          <Inbox className="w-5 h-5 text-text-muted" />
        </div>
        <h3 className="text-body font-semibold text-text-primary mb-1">
          {hasFilter ? "No requests match your filters" : "No requests yet"}
        </h3>
        <p className="text-body-sm text-text-muted">
          {hasFilter
            ? "Try adjusting your filters or search."
            : "Resident requests will appear here as they come in."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((r) => (
        <AdminRequestRow key={r.id} request={r} />
      ))}
    </div>
  );
}
