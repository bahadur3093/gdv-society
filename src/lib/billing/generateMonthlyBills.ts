// lib/billing/generateMonthlyBills.ts

import 'server-only';
import { prisma } from '@/lib/prisma';
import { BillStatus, Prisma } from '@prisma/client';

export interface GenerateBillsInput {
  month: number;        // 1-12
  year: number;
  dueDayOfMonth?: number;
}

export interface GenerateBillsResult {
  generatedCount: number;
  skippedCount: number;
  totalAmount: number;
  details: {
    villaNo: number;
    label: string;        // resident name OR owner name OR "Unclaimed"
    amount: number;
    status: 'CREATED' | 'SKIPPED';
    skipReason?: string;
  }[];
}

export async function generateMonthlyBills(
  input: GenerateBillsInput
): Promise<GenerateBillsResult> {
  const { month, year, dueDayOfMonth = 10 } = input;

  // ───────────────────────────────────────────────────────────
  // 1. Fetch config + all villas + existing bills for this period
  // ───────────────────────────────────────────────────────────
  const [settings, villas, existingBills] = await Promise.all([
    prisma.societySettings.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { perSqFtRate: true },
    }),
    // 🆕 ALL villas with positive area (not filtered by userId anymore)
    prisma.villa.findMany({
      where: { isBillable: true, areaInSqFt: { gt: 0 } },
      select: {
        id: true,
        villaNo: true,
        areaInSqFt: true,
        ownerName: true,
        userId: true,
        user: { select: { name: true } },
      },
      orderBy: { villaNo: 'asc' },
    }),
    // 🆕 Check existing bills by villa, not user
    prisma.maintenanceBill.findMany({
      where: { month, year },
      select: { villaId: true },
    }),
  ]);

  if (!settings) {
    throw new Error('Society settings not configured. Set per-sqft rate first.');
  }

  const ratePerSqFt = settings.perSqFtRate;
  const existingVillaIds = new Set(existingBills.map((b) => b.villaId));

  // ───────────────────────────────────────────────────────────
  // 2. Build bill payloads — one per villa
  // ───────────────────────────────────────────────────────────
  const dueDate = new Date(Date.UTC(year, month - 1, dueDayOfMonth));
  const createdAt = new Date(Date.UTC(year, month - 1, 1));

  const toCreate: Prisma.MaintenanceBillCreateManyInput[] = [];
  const details: GenerateBillsResult['details'] = [];

  for (const villa of villas) {
    const label = villa.user?.name ?? villa.ownerName ?? `Villa ${villa.villaNo}`;
    const amount = villa.areaInSqFt * ratePerSqFt;

    if (existingVillaIds.has(villa.id)) {
      details.push({
        villaNo: villa.villaNo,
        label,
        amount,
        status: 'SKIPPED',
        skipReason: 'Already billed',
      });
      continue;
    }

    toCreate.push({
      villaId: villa.id,
      userId: villa.userId ?? null, 
      month,
      year,
      areaInSqFt: villa.areaInSqFt,
      ratePerSqFt,
      amount,
      dueDate,
      status: BillStatus.PENDING,
      createdAt,
    });

    details.push({
      villaNo: villa.villaNo,
      label,
      amount,
      status: 'CREATED',
    });
  }

  // ───────────────────────────────────────────────────────────
  // 3. Bulk insert
  // ───────────────────────────────────────────────────────────
  if (toCreate.length > 0) {
    await prisma.maintenanceBill.createMany({ data: toCreate });
  }

  const totalAmount = toCreate.reduce((s, b) => s + b.amount, 0);

  return {
    generatedCount: toCreate.length,
    skippedCount: details.filter((d) => d.status === 'SKIPPED').length,
    totalAmount,
    details,
  };
}
