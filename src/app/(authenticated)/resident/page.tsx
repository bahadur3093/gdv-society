import { prisma } from "@/lib/prisma";
import { getResidentLedger } from "@/lib/billing/getResidentLedger";
import HeroCard from "./_components/HeroCard";
import StatPills from "./_components/StatPills";
import { Home } from "lucide-react";
import { requireResident } from "@/lib/auth/auth";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import RecentActivity from "./_components/RecentActivity";
import AnnouncementsCard from "./_components/AnnouncementsCard";
import HelpDeskCard from "./_components/HelpDeskCard";
import { getResidentPendingRequests } from "@/lib/billing/getResidentPendingRequests";
import PendingRequestsBanner from "./_components/PendingRequestsBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Dashboard — GDV Resident Hub",
};

export default async function ResidentHomePage() {
  const user = await requireResident();

  // Fetch ledger + announcements in parallel
  const [data, announcements, pendingRequests] = await Promise.all([
    getResidentLedger(user.id),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { publishDate: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        priority: true,
        publishDate: true,
      },
    }),
    getResidentPendingRequests(user.id),
  ]);

  // ─── Derivations ───
  const unpaidBills = data.entries.filter(
    (e) => e.type === "BILL" && e.status !== "PAID",
  );
  const unpaidBillsCount = unpaidBills.length;

  const oldestUnpaid = [...unpaidBills].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];

  const nextDueLabel = oldestUnpaid ? formatNextDue(oldestUnpaid.date) : null;

  // Top 5 most recent entries for activity feed
  const recentEntries = data.entries.slice(0, 5);

  const latestAnnouncement = announcements[0] ?? null;
  console.log({ latestAnnouncement });

  // ─── No villa edge case ───
  if (!data.villa) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={<Home />}
          title="No villa linked yet"
          description="Contact the society admin to link your villa to your account."
          tone="info"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {pendingRequests.length > 0 && (
        <PendingRequestsBanner requests={pendingRequests} />
      )}

      {/* ─── Hero ─── */}
      <HeroCard
        outstandingBalance={data.summary.outstandingBalance}
        unpaidBillsCount={unpaidBillsCount}
        nextDueLabel={nextDueLabel}
        status={data.summary.overallStatus}
      />

      {/* ─── Stat Pills ─── */}
      <StatPills
        villaNo={data.villa.villaNo}
        areaInSqFt={data.villa.areaInSqFt}
        ratePerSqFt={data.villa.ratePerSqFt}
      />

      {/* ─── Main 2-col grid (mobile: stacked) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left column (8 cols on desktop) */}
        <div className="md:col-span-8">
          <RecentActivity entries={recentEntries} />
        </div>

        {/* Right column (4 cols on desktop) */}
        <div className="md:col-span-4 space-y-6 md:space-y-8">
          <AnnouncementsCard announcement={latestAnnouncement} />
          <HelpDeskCard />
        </div>
      </div>
    </div>
  );
}

function formatNextDue(billDate: string): string {
  const date = new Date(billDate);
  const dueDate = new Date(date.getFullYear(), date.getMonth(), 10);
  return `next due ${dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
}
