import "server-only";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface AdminVillaRow {
  id: string;
  villaNo: number;
  type: string;
  ownerName: string;
  areaInSqM: number;
  areaInSqFt: number;
  remarks: string | null;
  isBillable: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Claim status (computed)
  userId: string | null;
  residentName: string | null;
  residentEmail: string | null;
  isClaimed: boolean;

  // Financial snapshot
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  unpaidBillsCount: number;
  lastPaymentDate: Date | null;
}

export interface AdminVillasCounts {
  all: number;
  billable: number;
  notBillable: number;
  claimed: number;
  unclaimed: number;
}

export interface AdminVillasData {
  rows: AdminVillaRow[];
  counts: AdminVillasCounts;
}

// ─────────────────────────────────────────────────────────────
//  List query
// ─────────────────────────────────────────────────────────────

export async function getAdminVillas(): Promise<AdminVillasData> {
  const villas = await prisma.villa.findMany({
    select: {
      id: true,
      villaNo: true,
      type: true,
      ownerName: true,
      areaInSqM: true,
      areaInSqFt: true,
      remarks: true,
      isBillable: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, email: true },
      },
      maintenanceBills: {
        select: {
          amount: true,
          allocations: { select: { amount: true } },
        },
      },
      payments: {
        select: {
          amount: true,
          paidAt: true,
        },
        orderBy: { paidAt: "desc" },
      },
    },
    orderBy: { villaNo: "asc" },
  });

  const rows: AdminVillaRow[] = villas.map((v) => {
    // Compute totals
    const totalBilled = v.maintenanceBills.reduce((s, b) => s + b.amount, 0);
    const totalPaidViaVilla = v.payments.reduce((s, p) => s + p.amount, 0);

    let outstandingBalance = 0;
    let unpaidBillsCount = 0;
    for (const bill of v.maintenanceBills) {
      const allocated = bill.allocations.reduce((s, a) => s + a.amount, 0);
      const remaining = Math.max(0, bill.amount - allocated);
      outstandingBalance += remaining;
      if (remaining > 0) unpaidBillsCount += 1;
    }

    const lastPayment = v.payments[0]?.paidAt ?? null;

    return {
      id: v.id,
      villaNo: v.villaNo,
      type: v.type,
      ownerName: v.ownerName,
      areaInSqM: v.areaInSqM,
      areaInSqFt: v.areaInSqFt,
      remarks: v.remarks,
      isBillable: v.isBillable,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,

      userId: v.userId,
      residentName: v.user?.name ?? null,
      residentEmail: v.user?.email ?? null,
      isClaimed: !!v.userId,

      totalBilled,
      totalPaid: totalPaidViaVilla,
      outstandingBalance,
      unpaidBillsCount,
      lastPaymentDate: lastPayment,
    };
  });

  const counts: AdminVillasCounts = {
    all: rows.length,
    billable: rows.filter((r) => r.isBillable).length,
    notBillable: rows.filter((r) => !r.isBillable).length,
    claimed: rows.filter((r) => r.isClaimed).length,
    unclaimed: rows.filter((r) => !r.isClaimed).length,
  };

  return { rows, counts };
}

// ─────────────────────────────────────────────────────────────
//  Single villa fetch (for edit form pre-fill)
// ─────────────────────────────────────────────────────────────

export async function getVillaById(id: string) {
  return prisma.villa.findUnique({
    where: { id },
    select: {
      id: true,
      villaNo: true,
      type: true,
      ownerName: true,
      areaInSqM: true,
      areaInSqFt: true,
      remarks: true,
      isBillable: true,
      userId: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
