import 'server-only';
import { prisma } from '@/lib/prisma';
import { BillStatus } from '@prisma/client';

export type VillaStatus =
  | 'PAID'
  | 'PARTIAL'
  | 'PENDING'
  | 'CREDIT'
  | 'NO_BILLS'
  | 'NOT_BILLABLE';

export interface VillaRow {
  villaId: string;
  villaNo: number;
  areaInSqFt: number;
  ownerName: string;
  isBillable: boolean;

  // Claim
  userId: string | null;
  residentName: string | null;
  residentEmail: string | null;
  isClaimed: boolean;

  // Financial
  monthlyDue: number;
  totalDue: number;
  totalPaid: number;
  outstandingBalance: number;
  unpaidBillsCount: number;
  lastPaymentDate: string | null;
  status: VillaStatus;
}

export interface MasterLedgerSummary {
  totalVillas: number;
  billableVillas: number;
  claimedVillas: number;
  villasWithBills: number;
  totalDueAcrossAll: number;
  totalCollectedAcrossAll: number;
  totalOutstandingAcrossAll: number;
  defaultersCount: number;
  fullyPaidCount: number;
}

export interface MasterLedger {
  summary: MasterLedgerSummary;
  rows: VillaRow[];
  ratePerSqFt: number;
}

export async function getMasterLedger(): Promise<MasterLedger> {
  const [villas, settings] = await Promise.all([
    prisma.villa.findMany({
      select: {
        id: true,
        villaNo: true,
        areaInSqFt: true,
        ownerName: true,
        isBillable: true,
        userId: true,
        user: { select: { id: true, name: true, email: true } },
        maintenanceBills: {
          select: {
            amount: true,
            status: true,
            allocations: { select: { amount: true } },
          },
        },
        payments: {
          select: { amount: true, paidAt: true },
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { villaNo: 'asc' },
    }),
    prisma.societySettings.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { perSqFtRate: true },
    }),
  ]);

  const ratePerSqFt = settings?.perSqFtRate ?? 3;

  // Some legacy payments may be linked only to user (villaId = null).
  // Fetch those for claimed villas too.
  const claimedUserIds = villas
    .map((v) => v.userId)
    .filter((id): id is string => id !== null);

  const userOnlyPayments = claimedUserIds.length > 0
    ? await prisma.payment.findMany({
        where: { userId: { in: claimedUserIds }, villaId: null },
        select: { userId: true, amount: true, paidAt: true },
      })
    : [];

  const userOnlyPaymentsByUserId = new Map<string, typeof userOnlyPayments>();
  for (const p of userOnlyPayments) {
    if (!p.userId) continue;
    const list = userOnlyPaymentsByUserId.get(p.userId) ?? [];
    list.push(p);
    userOnlyPaymentsByUserId.set(p.userId, list);
  }

  // ─────────────────────────────────────────────────────────────
  //  Build rows
  // ─────────────────────────────────────────────────────────────
  const rows: VillaRow[] = villas.map((v) => {
    const monthlyDue = v.isBillable ? v.areaInSqFt * ratePerSqFt : 0;

    const totalBills = v.maintenanceBills.reduce((s, b) => s + b.amount, 0);

    const totalPaidFromVilla = v.payments.reduce((s, p) => s + p.amount, 0);
    const totalPaidFromUser = v.userId
      ? (userOnlyPaymentsByUserId.get(v.userId) ?? []).reduce(
          (s, p) => s + p.amount,
          0
        )
      : 0;
    const totalPaid = totalPaidFromVilla + totalPaidFromUser;

    const outstandingBalance = totalBills - totalPaid;

    const unpaidBillsCount = v.maintenanceBills.filter(
      (b) => b.status !== BillStatus.PAID
    ).length;

    const allDates = [
      ...v.payments.map((p) => p.paidAt),
      ...(v.userId
        ? (userOnlyPaymentsByUserId.get(v.userId) ?? []).map((p) => p.paidAt)
        : []),
    ].sort((a, b) => b.getTime() - a.getTime());

    const status: VillaStatus = !v.isBillable
      ? 'NOT_BILLABLE'
      : totalBills === 0
      ? 'NO_BILLS'
      : outstandingBalance < 0
      ? 'CREDIT'
      : outstandingBalance === 0
      ? 'PAID'
      : totalPaid > 0
      ? 'PARTIAL'
      : 'PENDING';

    return {
      villaId: v.id,
      villaNo: v.villaNo,
      areaInSqFt: v.areaInSqFt,
      ownerName: v.ownerName,
      isBillable: v.isBillable,
      userId: v.userId,
      residentName: v.user?.name ?? null,
      residentEmail: v.user?.email ?? null,
      isClaimed: !!v.userId,
      monthlyDue,
      totalDue: totalBills,
      totalPaid,
      outstandingBalance,
      unpaidBillsCount,
      lastPaymentDate: allDates[0]?.toISOString() ?? null,
      status,
    };
  });

  // Sort: largest defaulters first, then by villa number
  rows.sort((a, b) => {
    if (a.outstandingBalance !== b.outstandingBalance) {
      return b.outstandingBalance - a.outstandingBalance;
    }
    return a.villaNo - b.villaNo;
  });

  // ─────────────────────────────────────────────────────────────
  //  Summary
  // ─────────────────────────────────────────────────────────────
  const summary: MasterLedgerSummary = {
    totalVillas: rows.length,
    billableVillas: rows.filter((r) => r.isBillable).length,
    claimedVillas: rows.filter((r) => r.isClaimed).length,
    villasWithBills: rows.filter((r) => r.totalDue > 0).length,
    totalDueAcrossAll: rows.reduce((s, r) => s + r.totalDue, 0),
    totalCollectedAcrossAll: rows.reduce((s, r) => s + r.totalPaid, 0),
    totalOutstandingAcrossAll: rows.reduce(
      (s, r) => s + Math.max(0, r.outstandingBalance),
      0
    ),
    defaultersCount: rows.filter((r) => r.outstandingBalance > 0).length,
    fullyPaidCount: rows.filter(
      (r) => r.outstandingBalance === 0 && r.totalDue > 0
    ).length,
  };

  return { summary, rows, ratePerSqFt };
}
