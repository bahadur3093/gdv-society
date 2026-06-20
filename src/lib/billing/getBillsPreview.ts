import 'server-only';
import { prisma } from '@/lib/prisma';

export interface BillsPreview {
  month: number;
  year: number;
  ratePerSqFt: number;
  eligibleVillas: number;
  alreadyBilled: number;
  newBillsCount: number;
  totalAmount: number;
}

export async function getBillsPreview(
  month: number,
  year: number
): Promise<BillsPreview> {
  const [settings, villas, existingBills] = await Promise.all([
    prisma.societySettings.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { perSqFtRate: true },
    }),
    // 🆕 ALL villas with area — not filtered by userId
    prisma.villa.findMany({
      where: { isBillable: true, areaInSqFt: { gt: 0 } },
      select: { id: true, areaInSqFt: true },
    }),
    // 🆕 Existing bills tracked by villaId
    prisma.maintenanceBill.findMany({
      where: { month, year },
      select: { villaId: true },
    }),
  ]);

  const ratePerSqFt = settings?.perSqFtRate ?? 3;
  const existingVillaIds = new Set(existingBills.map((b) => b.villaId));

  const newBills = villas.filter((v) => !existingVillaIds.has(v.id));
  const totalAmount = newBills.reduce(
    (s, v) => s + v.areaInSqFt * ratePerSqFt,
    0
  );

  return {
    month,
    year,
    ratePerSqFt,
    eligibleVillas: villas.length,
    alreadyBilled: existingBills.length,
    newBillsCount: newBills.length,
    totalAmount,
  };
}
