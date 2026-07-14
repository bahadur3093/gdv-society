import { requireAdmin } from "@/lib/auth/auth";
import { listAllRequests, getHelpdeskStats } from "@/lib/helpdesk/queries";
import type { RequestStatus } from "@prisma/client";
import AdminStatsCards from "./_components/AdminStatsCards";
import AdminStatusTabs, { type TabKey } from "./_components/AdminStatusTabs";
import AdminSearchBar from "./_components/AdminSearchBar";
import AdminRequestsList from "./_components/AdminRequestsList";

export const dynamic = "force-dynamic";

export default async function AdminHelpdeskPage(props: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await props.searchParams;
  await requireAdmin();

  const rawStatus = params.status ?? "OPEN";
  const currentTab = rawStatus as TabKey;
  const search = params.q?.trim() ?? "";

  // Resolve query filter for the list
  const queryStatus: RequestStatus | "ALL" = resolveQueryStatus(currentTab);

  const [requests, stats] = await Promise.all([
    listAllRequests({
      status: queryStatus,
      search: search || undefined,
    }),
    getHelpdeskStats(),
  ]);

  // Filter OPEN client-side: combines PENDING + IN_PROGRESS + REOPENED
  const filteredRequests =
    currentTab === "OPEN"
      ? requests.filter(
          (r) =>
            r.status === "PENDING" ||
            r.status === "IN_PROGRESS" ||
            r.status === "REOPENED",
        )
      : requests;

  const hasFilter = currentTab !== "ALL" || search.length > 0;

  return (
    <div className="min-h-full pb-24 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-h2 font-bold text-text-primary">Helpdesk</h1>
        <p className="text-body-sm text-text-muted mt-0.5">
          Resident requests, comments, and resolutions.
        </p>
      </div>

      {/* Stats */}
      <AdminStatsCards stats={stats} />

      {/* Filters row */}
      <div className="space-y-3">
        <AdminSearchBar />
        <AdminStatusTabs current={currentTab} />
      </div>

      {/* Results */}
      <AdminRequestsList requests={filteredRequests} hasFilter={hasFilter} />
    </div>
  );
}

function resolveQueryStatus(tab: TabKey): RequestStatus | "ALL" {
  if (tab === "ALL" || tab === "OPEN") return "ALL";
  return tab;
}
