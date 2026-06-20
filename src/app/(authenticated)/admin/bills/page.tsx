import { prisma } from "@/lib/prisma";
import { getBillsPreview } from "@/lib/billing/getBillsPreview";
import GenerateBillsForm from "./_components/GenerateBillsForm";
import RecentGenerations from "./_components/RecentGenerations";
import { Receipt } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Receipt className="w-8 h-8 text-violet-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Generate Monthly Bills
          </h1>
          <p className="text-slate-400">
            Create maintenance bills for all villas based on their sqft × rate.
          </p>
        </div>
      </header>

      <GenerateBillsForm
        initialMonth={month}
        initialYear={year}
        preview={preview}
      />

      <RecentGenerations groups={recentGenerations} />
    </div>
  );
}

// ─── Helper: aggregate recent bill generations ───────────────

async function getRecentGenerations() {
  const bills = await prisma.maintenanceBill.findMany({
    select: { month: true, year: true, amount: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 500, // recent enough
  });

  // Group by month/year
  const map = new Map<
    string,
    { month: number; year: number; count: number; total: number; latest: Date }
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
