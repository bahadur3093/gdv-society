import Link from "next/link";
import { Plus } from "lucide-react";
import { requireResident } from "@/lib/auth/auth";
import { listResidentRequests } from "@/lib/helpdesk/queries";
import type { RequestStatus } from "@prisma/client";
import { cn } from "@/lib/utils/utils";
import EmptyRequests from "../_components/EmptyRequests";
import RequestCard from "../_components/RequestCard";

export const dynamic = "force-dynamic";

type FilterKey = "ALL" | RequestStatus;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
];

export default async function ResidentRequestsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await props.searchParams;
  const user = await requireResident();

  const statusParam = (params.status ?? "ALL") as FilterKey;

  const requests = await listResidentRequests(user.id, {
    status: statusParam === "ALL" ? "ALL" : statusParam,
  });

  return (
    <>
      <div className="min-h-full pb-24">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-bold text-text-primary">Support</h1>
            <p className="text-body-sm text-text-muted mt-0.5">
              Raise requests, chat with admins.
            </p>
          </div>

          <Link
            href={"/resident/requests/new"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg",
              "bg-brand-primary text-white text-body-sm font-semibold",
              "shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform",
            )}
          >
            <Plus className="w-4 h-4" />
            New
          </Link>
        </div>

        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => {
              const isActive = statusParam === f.key;
              const href =
                f.key === "ALL"
                  ? "/resident/requests"
                  : "/resident/requests?status=" + f.key;

              return (
                <Link
                  key={f.key}
                  href={href}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-body-sm font-medium border transition-colors",
                    isActive
                      ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                      : "bg-bg-sunken text-text-muted border-border-subtle hover:text-text-primary",
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-4 space-y-2">
          {requests.length === 0 ? (
            <EmptyRequests hasFilter={statusParam !== "ALL"} />
          ) : (
            requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                href={"/resident/requests/" + r.id}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
