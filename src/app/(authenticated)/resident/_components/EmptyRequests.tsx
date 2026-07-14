import Link from "next/link";
import { LifeBuoy, Plus } from "lucide-react";

export default function EmptyRequests({ hasFilter }: { hasFilter: boolean }) {
  if (hasFilter) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-body-sm text-text-muted">
          No requests match this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
        <LifeBuoy className="w-7 h-7 text-brand-primary" />
      </div>
      <h3 className="text-h4 font-semibold text-text-primary mb-1">
        No requests yet
      </h3>
      <p className="text-body-sm text-text-muted mb-5 max-w-xs mx-auto">
        Need help with something? Raise a request and our admins will respond.
      </p>
      <Link
        href={"/resident/requests/new"}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg btn-brand-gradient text-white text-body-sm font-semibold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4" />
        Raise a Request
      </Link>
    </div>
  );
}
