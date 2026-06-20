import { CreditCard } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { BillStatus } from '@prisma/client';
import RecordPaymentForm from './_components/RecordPaymentForm';
import { requireAdmin } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Record Payment — Admin' };

interface PageProps {
  searchParams: Promise<{ villa?: string }>;
}

export default async function RecordPaymentPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { villa: preselectedVillaId } = await searchParams;

  // Fetch all villas with their outstanding balance (computed)
  const villas = await prisma.villa.findMany({
    where: { isBillable: true },
    select: {
      id: true,
      villaNo: true,
      ownerName: true,
      areaInSqFt: true,
      userId: true,
      user: {
        select: { id: true, name: true, email: true },
      },
      maintenanceBills: {
        where: { status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] } },
        select: { amount: true, allocations: { select: { amount: true } } },
      },
    },
    orderBy: { villaNo: 'asc' },
  });

  // Also fetch levies for claimed villas (per-user concept)
  const claimedUserIds = villas
    .map((v) => v.userId)
    .filter((id): id is string => id !== null);

  const levies = claimedUserIds.length
    ? await prisma.specialLevy.findMany({
        where: {
          userId: { in: claimedUserIds },
          status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
        },
        select: { userId: true, amount: true, allocations: { select: { amount: true } } },
      })
    : [];

  const leviesByUserId = new Map<string, number>();
  for (const l of levies) {
    if (!l.userId) continue;
    const allocated = l.allocations.reduce((s, a) => s + a.amount, 0);
    const owed = Math.max(0, l.amount - allocated);
    leviesByUserId.set(l.userId, (leviesByUserId.get(l.userId) ?? 0) + owed);
  }

  // Compute per-villa outstanding
  const options = villas
    .map((v) => {
      const billsOwed = v.maintenanceBills.reduce((s, b) => {
        const paid = b.allocations.reduce((sa, a) => sa + a.amount, 0);
        return s + Math.max(0, b.amount - paid);
      }, 0);
      const leviesOwed = v.userId ? (leviesByUserId.get(v.userId) ?? 0) : 0;

      return {
        villaId: v.id,
        villaNo: v.villaNo,
        ownerName: v.ownerName,
        userId: v.userId,
        residentName: v.user?.name ?? null,
        outstanding: billsOwed + leviesOwed,
      };
    })
    // Sort: villas with outstanding first, by villa no
    .sort((a, b) => {
      if (a.outstanding > 0 && b.outstanding === 0) return -1;
      if (a.outstanding === 0 && b.outstanding > 0) return 1;
      return a.villaNo - b.villaNo;
    });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-violet-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Record Payment</h1>
          <p className="text-slate-400">
            Record a payment received from a villa owner or resident. It will be auto-allocated to the oldest unpaid bills first.
          </p>
        </div>
      </header>

      <RecordPaymentForm
        villas={options}
        preselectedVillaId={preselectedVillaId}
      />
    </div>
  );
}
