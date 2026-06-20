// lib/billing/getPaymentPreview.ts

import 'server-only';
import { prisma } from '@/lib/prisma';
import { BillStatus } from '@prisma/client';

export interface PaymentPreviewItem {
  type: 'BILL' | 'LEVY';
  targetId: string;
  description: string;
  amountAllocated: number;
  fullyCovered: boolean;
}

export interface PaymentPreview {
  totalOutstanding: number;
  allocations: PaymentPreviewItem[];
  unallocatedAmount: number;
}

export async function getPaymentPreview(
  villaId: string,
  residentUserId: string | null,
  amount: number
): Promise<PaymentPreview> {
  if (amount <= 0 || !villaId) {
    return { totalOutstanding: 0, allocations: [], unallocatedAmount: 0 };
  }

  const [bills, levies] = await Promise.all([
    prisma.maintenanceBill.findMany({
      where: {
        villaId,
        status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
      },
      include: { allocations: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    }),
    residentUserId
      ? prisma.specialLevy.findMany({
          where: {
            userId: residentUserId,
            status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
          },
          include: { allocations: true },
          orderBy: { createdAt: 'asc' },
        })
      : Promise.resolve([]),
  ]);

  type Item = {
    type: 'BILL' | 'LEVY';
    id: string;
    amount: number;
    paid: number;
    description: string;
    date: Date;
  };

  const queue: Item[] = [
    ...bills.map(
      (b): Item => ({
        type: 'BILL',
        id: b.id,
        amount: b.amount,
        paid: b.allocations.reduce((s, a) => s + a.amount, 0),
        description: `Maintenance — ${monthName(b.month)} ${b.year}`,
        date: new Date(Date.UTC(b.year, b.month - 1, 1)),
      })
    ),
    ...levies.map(
      (l): Item => ({
        type: 'LEVY',
        id: l.id,
        amount: l.amount,
        paid: l.allocations.reduce((s, a) => s + a.amount, 0),
        description: l.title,
        date: l.createdAt,
      })
    ),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalOutstanding = queue.reduce((s, i) => s + (i.amount - i.paid), 0);

  let remaining = amount;
  const allocations: PaymentPreviewItem[] = [];

  for (const item of queue) {
    if (remaining <= 0) break;
    const outstanding = item.amount - item.paid;
    if (outstanding <= 0) continue;

    const toAllocate = Math.min(remaining, outstanding);
    allocations.push({
      type: item.type,
      targetId: item.id,
      description: item.description,
      amountAllocated: toAllocate,
      fullyCovered: toAllocate >= outstanding,
    });
    remaining -= toAllocate;
  }

  return { totalOutstanding, allocations, unallocatedAmount: remaining };
}

function monthName(m: number) {
  return new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'long' });
}
