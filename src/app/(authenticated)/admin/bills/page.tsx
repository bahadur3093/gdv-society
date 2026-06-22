import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBillsPreview } from "@/lib/billing/getBillsPreview";
import PageHeader from "@/components/navigation/PageHeader";
import GenerateBillsForm from "./_components/GenerateBillsForm";
import RecentGenerations from "./_components/RecentGenerations";
import { requireAdmin } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Generate Bills — Admin",
};

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function GenerateBillsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);

  const [preview, recentGenerations] = await Promise.all([
    getBillsPreview(month, year),
    getRecentGenerations(),
  ]);

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        }
        back={{ href: "/admin/ledger", label: "Back to Master Ledger" }}
        title="Generate Bills"
        description="Create monthly maintenance bills for all billable villas in one click."
      />

      <GenerateBillsForm
        initialMonth={month}
        initialYear={year}
        preview={preview}
      />

      <RecentGenerations groups={recentGenerations} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helper — aggregate recent bill generations
// ─────────────────────────────────────────────────────────────

async function getRecentGenerations() {
  const bills = await prisma.maintenanceBill.findMany({
    select: { month: true, year: true, amount: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const map = new Map<
    string,
    {
      month: number;
      year: number;
      count: number;
      total: number;
      latest: Date;
    }
  >();

  for (const b of bills) {
    const key = `${b.year}-${b.month}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.total += b.amount;
      if (b.createdAt > existing.latest) existing.latest = b.createdAt;
    } else {
      map.set(key, {
        month: b.month,
        year: b.year,
        count: 1,
        total: b.amount,
        latest: b.createdAt,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.latest.getTime() - a.latest.getTime())
    .slice(0, 6);
}
