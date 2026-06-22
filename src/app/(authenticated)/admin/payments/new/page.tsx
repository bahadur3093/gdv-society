import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BillStatus } from "@prisma/client";
import PageHeader from "@/components/navigation/PageHeader";
import RecordPaymentForm from "./_components/RecordPaymentForm";
import { requireAdmin } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Record Payment — Admin" };

interface PageProps {
  searchParams: Promise<{ villa?: string }>;
}

export default async function RecordPaymentPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { villa: preselectedVillaId } = await searchParams;

  // Fetch all billable villas with their outstanding balance
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
    orderBy: { villaNo: "asc" },
  });

  // Levies (per-user concept, only for claimed villas)
  const claimedUserIds = villas
    .map((v) => v.userId)
    .filter((id): id is string => id !== null);

  const levies = claimedUserIds.length
    ? await prisma.specialLevy.findMany({
        where: {
          userId: { in: claimedUserIds },
          status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
        },
        select: {
          userId: true,
          amount: true,
          allocations: { select: { amount: true } },
        },
      })
    : [];

  const leviesByUserId = new Map<string, number>();
  for (const l of levies) {
    if (!l.userId) continue;
    const allocated = l.allocations.reduce((s, a) => s + a.amount, 0);
    const owed = Math.max(0, l.amount - allocated);
    leviesByUserId.set(l.userId, (leviesByUserId.get(l.userId) ?? 0) + owed);
  }

  // Compute per-villa outstanding + build options
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
        residentEmail: v.user?.email ?? null,
        areaInSqFt: v.areaInSqFt,
        outstanding: billsOwed + leviesOwed,
      };
    })
    .sort((a, b) => {
      if (a.outstanding > 0 && b.outstanding === 0) return -1;
      if (a.outstanding === 0 && b.outstanding > 0) return 1;
      return a.villaNo - b.villaNo;
    });

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-success/10 text-success flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        }
        back={{ href: "/admin/ledger", label: "Back to Master Ledger" }}
        title="Record Payment"
        description="Log a payment received from a villa. It will be auto-allocated to the oldest unpaid items first."
      />

      <RecordPaymentForm
        villas={options}
        preselectedVillaId={preselectedVillaId}
      />
    </div>
  );
}
