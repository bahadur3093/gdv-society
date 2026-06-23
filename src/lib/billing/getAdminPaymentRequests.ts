import 'server-only';
import { prisma } from '@/lib/prisma';

type PaymentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface AdminPaymentRequestRow {
  id: string;
  villaId: string;
  villaNo: number;
  villaOwnerName: string;
  villaUserId: string | null;
  residentName: string | null;
  residentEmail: string | null;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  receiptUrl: string | null;
  submittedAt: Date;
  status: PaymentRequestStatus;
  reviewedAt: Date | null;
  reviewerName: string | null;
  reviewNotes: string | null;
  villaOutstanding: number;  // current outstanding for context
}

export interface AdminPaymentRequestsCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface AdminPaymentRequestsData {
  rows: AdminPaymentRequestRow[];
  counts: AdminPaymentRequestsCounts;
}

export async function getAdminPaymentRequests(): Promise<AdminPaymentRequestsData> {
  // Fetch all requests with the right joins
  const requests = await prisma.paymentRequest.findMany({
    select: {
      id: true,
      villaId: true,
      amount: true,
      method: true,
      reference: true,
      notes: true,
      receiptUrl: true,
      submittedAt: true,
      status: true,
      reviewedAt: true,
      reviewNotes: true,
      villa: {
        select: {
          villaNo: true,
          ownerName: true,
          userId: true,
          user: {
            select: { name: true, email: true },
          },
          maintenanceBills: {
            where: { status: { in: ['PENDING', 'PARTIAL'] } },
            select: {
              amount: true,
              allocations: { select: { amount: true } },
            },
          },
        },
      },
      reviewer: {
        select: { name: true },
      },
    },
    orderBy: [
      { status: 'asc' },        // PENDING first
      { submittedAt: 'desc' },  // newest first within each status
    ],
  });

  const rows: AdminPaymentRequestRow[] = requests.map((r) => {
    // Compute current outstanding for the villa
    const outstanding = r.villa.maintenanceBills.reduce((sum, bill) => {
      const allocated = bill.allocations.reduce((a, alloc) => a + alloc.amount, 0);
      return sum + Math.max(0, bill.amount - allocated);
    }, 0);

    return {
      id: r.id,
      villaId: r.villaId,
      villaNo: r.villa.villaNo,
      villaOwnerName: r.villa.ownerName,
      villaUserId: r.villa.userId,
      residentName: r.villa.user?.name ?? null,
      residentEmail: r.villa.user?.email ?? null,
      amount: r.amount,
      method: r.method,
      reference: r.reference,
      notes: r.notes,
      receiptUrl: r.receiptUrl,
      submittedAt: r.submittedAt,
      status: r.status,
      reviewedAt: r.reviewedAt,
      reviewerName: r.reviewer?.name ?? null,
      reviewNotes: r.reviewNotes,
      villaOutstanding: outstanding,
    };
  });

  // Counts for filter badges
  const counts: AdminPaymentRequestsCounts = {
    pending: rows.filter((r) => r.status === 'PENDING').length,
    approved: rows.filter((r) => r.status === 'APPROVED').length,
    rejected: rows.filter((r) => r.status === 'REJECTED').length,
    total: rows.length,
  };

  return { rows, counts };
}

/**
 * Lightweight count-only query for sidebar badge.
 * Fast — no joins, just a SELECT COUNT.
 */
export async function getPendingPaymentRequestsCount(): Promise<number> {
  return prisma.paymentRequest.count({
    where: { status: 'PENDING' },
  });
}