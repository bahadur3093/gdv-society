import 'server-only';
import { prisma } from '@/lib/prisma';
import { BillStatus, PaymentMethod } from '@prisma/client';

export interface RecordPaymentInput {
  villaId: string;              // 🆕 PRIMARY — villa is the billing entity
  residentUserId?: string;      // 🆕 OPTIONAL — snapshot of resident if claimed
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paidAt?: Date;
  recordedByAdminId: string;
}

export interface AllocationDetail {
  type: 'BILL' | 'LEVY';
  targetId: string;
  description: string;
  amountAllocated: number;
}

export interface RecordPaymentResult {
  paymentId: string;
  allocations: AllocationDetail[];
  unallocatedAmount: number;
}

export async function recordPayment(
  input: RecordPaymentInput
): Promise<RecordPaymentResult> {
  if (input.amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  return prisma.$transaction(async (tx) => {
    // ─────────────────────────────────────────────────────────
    // 1. Create the payment record (villa-bound)
    // ─────────────────────────────────────────────────────────
    const payment = await tx.payment.create({
      data: {
        villaId: input.villaId,
        userId: input.residentUserId ?? null,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
        paidAt: input.paidAt ?? new Date(),
        recordedBy: input.recordedByAdminId,
      },
    });

    // ─────────────────────────────────────────────────────────
    // 2. Find unpaid bills FOR THIS VILLA (oldest first)
    // ─────────────────────────────────────────────────────────
    const unpaidBills = await tx.maintenanceBill.findMany({
      where: {
        villaId: input.villaId,         // 🆕 by villa
        status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
      },
      include: { allocations: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    // Levies remain per-user (they need a registered resident to be charged to)
    const unpaidLevies = input.residentUserId
      ? await tx.specialLevy.findMany({
          where: {
            userId: input.residentUserId,
            status: { in: [BillStatus.PENDING, BillStatus.PARTIAL] },
          },
          include: { allocations: true },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    // ─────────────────────────────────────────────────────────
    // 3. Build merged queue sorted by date
    // ─────────────────────────────────────────────────────────
    type QueueItem = {
      type: 'BILL' | 'LEVY';
      id: string;
      amount: number;
      paid: number;
      description: string;
      date: Date;
    };

    const queue: QueueItem[] = [
      ...unpaidBills.map(
        (b): QueueItem => ({
          type: 'BILL',
          id: b.id,
          amount: b.amount,
          paid: b.allocations.reduce((s, a) => s + a.amount, 0),
          description: `Maintenance — ${monthName(b.month)} ${b.year}`,
          date: new Date(Date.UTC(b.year, b.month - 1, 1)),
        })
      ),
      ...unpaidLevies.map(
        (l): QueueItem => ({
          type: 'LEVY',
          id: l.id,
          amount: l.amount,
          paid: l.allocations.reduce((s, a) => s + a.amount, 0),
          description: l.title,
          date: l.createdAt,
        })
      ),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // ─────────────────────────────────────────────────────────
    // 4. Allocate from oldest
    // ─────────────────────────────────────────────────────────
    let remaining = input.amount;
    const allocations: AllocationDetail[] = [];

    for (const item of queue) {
      if (remaining <= 0) break;

      const outstanding = item.amount - item.paid;
      if (outstanding <= 0) continue;

      const toAllocate = Math.min(remaining, outstanding);

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          amount: toAllocate,
          ...(item.type === 'BILL'
            ? { billId: item.id }
            : { levyId: item.id }),
        },
      });

      const newPaidTotal = item.paid + toAllocate;
      const newStatus =
        newPaidTotal >= item.amount
          ? BillStatus.PAID
          : newPaidTotal > 0
          ? BillStatus.PARTIAL
          : BillStatus.PENDING;

      if (item.type === 'BILL') {
        await tx.maintenanceBill.update({
          where: { id: item.id },
          data: { status: newStatus },
        });
      } else {
        await tx.specialLevy.update({
          where: { id: item.id },
          data: { status: newStatus },
        });
      }

      allocations.push({
        type: item.type,
        targetId: item.id,
        description: item.description,
        amountAllocated: toAllocate,
      });

      remaining -= toAllocate;
    }

    return {
      paymentId: payment.id,
      allocations,
      unallocatedAmount: remaining,
    };
  });
}

// ─── Helper ─────────────────────────────────────────────────

function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'long' });
}
