import 'server-only';
import { prisma } from '@/lib/prisma';
import { BillStatus } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

export type LedgerEntryType = 'BILL' | 'PAYMENT' | 'LEVY' | 'ADJUSTMENT';

export interface PassbookEntry {
  id: string;
  date: string;
  type: LedgerEntryType;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  reference?: string;
  status?: BillStatus;
  balance: number;
}

export interface ResidentLedger {
  resident: {
    id: string;
    name: string;
    email: string;
    plotNumber: string | null;
  };
  villa: {
    id: string;
    villaNo: number;
    areaInSqFt: number;
    ratePerSqFt: number;
  } | null;
  summary: {
    monthlyDue: number;
    totalDue: number;
    totalPaid: number;
    outstandingBalance: number;
    overallStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'CREDIT';
  };
  entries: PassbookEntry[];
}

// ═══════════════════════════════════════════════════════════════
//  MAIN QUERY
// ═══════════════════════════════════════════════════════════════

export async function getResidentLedger(userId: string): Promise<ResidentLedger> {
  // 1. Find user + their villa (one query)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      plotNumber: true,
      villa: {
        select: {
          id: true,
          villaNo: true,
          areaInSqFt: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const settings = await prisma.societySettings.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { perSqFtRate: true },
  });

  const ratePerSqFt = settings?.perSqFtRate ?? 3;
  const areaInSqFt = user.villa?.areaInSqFt ?? 0;
  const monthlyDue = areaInSqFt * ratePerSqFt;

  // 2. Fetch bills/payments based on villa link
  // 🆕 Bills come from villa, not from user
  const [bills, paymentsByVilla, paymentsByUser, levies, adjustments] =
    await Promise.all([
      user.villa
        ? prisma.maintenanceBill.findMany({
            where: { villaId: user.villa.id },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
      user.villa
        ? prisma.payment.findMany({
            where: { villaId: user.villa.id },
            orderBy: { paidAt: 'desc' },
          })
        : Promise.resolve([]),
      // Legacy: payments may exist with userId only (no villaId)
      prisma.payment.findMany({
        where: { userId, villaId: null },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.specialLevy.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adjustment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  // 3. Merge & dedupe payments (in case of overlap)
  const seenPaymentIds = new Set<string>();
  const payments = [...paymentsByVilla, ...paymentsByUser].filter((p) => {
    if (seenPaymentIds.has(p.id)) return false;
    seenPaymentIds.add(p.id);
    return true;
  });

  // ─────────────────────────────────────────────────────────────
  //  Build raw passbook entries (no balance yet)
  // ─────────────────────────────────────────────────────────────

  type RawEntry = Omit<PassbookEntry, 'balance'> & { sortDate: Date };

  const raw: RawEntry[] = [
    ...bills.map((b): RawEntry => ({
      id: b.id,
      date: b.createdAt.toISOString(),
      sortDate: b.createdAt,
      type: 'BILL',
      direction: 'DEBIT',
      amount: b.amount,
      description: `Maintenance — ${monthName(b.month)} ${b.year}`,
      status: b.status,
    })),
    ...payments.map((p): RawEntry => ({
      id: p.id,
      date: p.paidAt.toISOString(),
      sortDate: p.paidAt,
      type: 'PAYMENT',
      direction: 'CREDIT',
      amount: p.amount,
      description: `Payment received (${p.method})`,
      reference: p.reference ?? undefined,
    })),
    ...levies.map((l): RawEntry => ({
      id: l.id,
      date: l.createdAt.toISOString(),
      sortDate: l.createdAt,
      type: 'LEVY',
      direction: 'DEBIT',
      amount: l.amount,
      description: `Special Levy: ${l.title}`,
      status: l.status,
    })),
    ...adjustments.map((a): RawEntry => ({
      id: a.id,
      date: a.createdAt.toISOString(),
      sortDate: a.createdAt,
      type: 'ADJUSTMENT',
      direction: a.amount >= 0 ? 'DEBIT' : 'CREDIT',
      amount: Math.abs(a.amount),
      description: `${formatAdjustmentType(a.type)}: ${a.reason}`,
    })),
  ];

  // ─────────────────────────────────────────────────────────────
  //  Compute running balance (oldest → newest, then reverse)
  // ─────────────────────────────────────────────────────────────

  const oldestFirst = [...raw].sort(
    (a, b) => a.sortDate.getTime() - b.sortDate.getTime()
  );

  let runningBalance = 0;
  const withBalance = oldestFirst.map((entry) => {
    runningBalance += entry.direction === 'DEBIT' ? entry.amount : -entry.amount;
    return { ...entry, balance: runningBalance };
  });

  const entries: PassbookEntry[] = withBalance
    .reverse()
    .map(({ sortDate, ...e }) => e);

  // ─────────────────────────────────────────────────────────────
  //  Summary
  // ─────────────────────────────────────────────────────────────

  const totalDue =
    bills.reduce((s, b) => s + b.amount, 0) +
    levies.reduce((s, l) => s + l.amount, 0) +
    adjustments.reduce((s, a) => s + a.amount, 0);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const outstandingBalance = totalDue - totalPaid;

  const overallStatus: ResidentLedger['summary']['overallStatus'] =
    outstandingBalance < 0
      ? 'CREDIT'
      : outstandingBalance === 0
      ? 'PAID'
      : totalPaid > 0
      ? 'PARTIAL'
      : 'PENDING';

  return {
    resident: {
      id: user.id,
      name: user.name,
      email: user.email,
      plotNumber: user.plotNumber,
    },
    villa: user.villa
      ? {
          id: user.villa.id,
          villaNo: user.villa.villaNo,
          areaInSqFt: user.villa.areaInSqFt,
          ratePerSqFt,
        }
      : null,
    summary: {
      monthlyDue,
      totalDue,
      totalPaid,
      outstandingBalance,
      overallStatus,
    },
    entries,
  };
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'long' });
}

function formatAdjustmentType(type: string): string {
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
