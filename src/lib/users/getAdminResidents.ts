import "server-only";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface AdminResidentRow {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  plotNumber: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Villa link (computed)
  villaId: string | null;
  villaNo: number | null;
  villaSqFt: number | null;
  isClaimed: boolean;

  // Financial snapshot
  outstandingBalance: number;
  lastPaymentDate: Date | null;
  unpaidBillsCount: number;

  // Activity
  familyMemberCount: number;
  pendingRequestsCount: number;
  accountStatus: "PENDING" | "APPROVED" | "SUSPENDED";
}

export interface AdminResidentsCounts {
  all: number;
  claimed: number;
  unclaimed: number;
  unverified: number;
  pending: number;
}

export interface AdminResidentsData {
  rows: AdminResidentRow[];
  counts: AdminResidentsCounts;
}

// ─────────────────────────────────────────────────────────────
//  List query
// ─────────────────────────────────────────────────────────────

export async function getAdminResidents(): Promise<AdminResidentsData> {
  // Fetch all residents with their relations in one query
  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      plotNumber: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
      villa: {
        select: {
          id: true,
          villaNo: true,
          areaInSqFt: true,
          maintenanceBills: {
            where: { status: { in: ["PENDING", "PARTIAL"] } },
            select: {
              amount: true,
              allocations: { select: { amount: true } },
            },
          },
          payments: {
            orderBy: { paidAt: "desc" },
            take: 1,
            select: { paidAt: true },
          },
        },
      },
      _count: {
        select: {
          familyMembers: true,
          residentRequests: {
            where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          },
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  const rows: AdminResidentRow[] = residents.map((u) => {
    // Compute outstanding for the linked villa
    let outstanding = 0;
    let unpaidCount = 0;
    let lastPayment: Date | null = null;

    if (u.villa) {
      for (const bill of u.villa.maintenanceBills) {
        const allocated = bill.allocations.reduce((s, a) => s + a.amount, 0);
        const remaining = Math.max(0, bill.amount - allocated);
        outstanding += remaining;
        if (remaining > 0) unpaidCount += 1;
      }
      lastPayment = u.villa.payments[0]?.paidAt ?? null;
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified,
      plotNumber: u.plotNumber,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,

      villaId: u.villa?.id ?? null,
      villaNo: u.villa?.villaNo ?? null,
      villaSqFt: u.villa?.areaInSqFt ?? null,
      isClaimed: !!u.villa,

      outstandingBalance: outstanding,
      lastPaymentDate: lastPayment,
      unpaidBillsCount: unpaidCount,

      familyMemberCount: u._count.familyMembers,
      pendingRequestsCount: u._count.residentRequests,
      accountStatus: u.accountStatus,
    };
  });

  const counts: AdminResidentsCounts = {
    all: rows.length,
    claimed: rows.filter((r) => r.isClaimed).length,
    unclaimed: rows.filter((r) => !r.isClaimed).length,
    unverified: rows.filter((r) => !r.emailVerified).length,
    pending: rows.filter((r) => r.accountStatus === 'PENDING').length,
  };

  return { rows, counts };
}

// ─────────────────────────────────────────────────────────────
//  Detail query — for /admin/residents/[id]
// ─────────────────────────────────────────────────────────────

export interface AdminResidentDetail {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  plotNumber: string | null;
  createdAt: Date;
  updatedAt: Date;

  villa: {
    id: string;
    villaNo: number;
    areaInSqFt: number;
    type: string;
    ownerName: string;
  } | null;

  // Financial summary
  outstandingBalance: number;
  totalPaid: number;
  totalDue: number;
  unpaidBillsCount: number;
  lastPaymentDate: Date | null;

  // Family
  familyMembers: Array<{
    id: string;
    name: string;
    relationship: string;
    contact: string;
    addedAt: Date;
  }>;

  // Recent activity (last 5 of bills + payments)
  recentActivity: Array<{
    id: string;
    type: "BILL" | "PAYMENT";
    description: string;
    amount: number;
    date: Date;
    direction: "DEBIT" | "CREDIT";
  }>;

  // Pending requests
  pendingRequestsCount: number;
  pendingPaymentRequestsCount: number;
  accountStatus: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

export async function getAdminResidentDetail(
  userId: string,
): Promise<AdminResidentDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "RESIDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      plotNumber: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,

      villa: {
        select: {
          id: true,
          villaNo: true,
          areaInSqFt: true,
          type: true,
          ownerName: true,
          maintenanceBills: {
            select: {
              id: true,
              month: true,
              year: true,
              amount: true,
              createdAt: true,
              allocations: { select: { amount: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10, // recent bills
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              paidAt: true,
              reference: true,
            },
            orderBy: { paidAt: "desc" },
            take: 10, // recent payments
          },
        },
      },

      familyMembers: {
        select: {
          id: true,
          name: true,
          relationship: true,
          contact: true,
          addedAt: true,
        },
        orderBy: { addedAt: "desc" },
      },

      _count: {
        select: {
          residentRequests: {
            where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          },
          paymentRequestsSubmitted: {
            where: { status: "PENDING" },
          },
        },
      },
    },
  });

  if (!user) return null;

  // ─── Compute financial summary ───
  let outstanding = 0;
  let totalDue = 0;
  let unpaidCount = 0;

  if (user.villa) {
    for (const bill of user.villa.maintenanceBills) {
      totalDue += bill.amount;
      const allocated = bill.allocations.reduce((s, a) => s + a.amount, 0);
      const remaining = Math.max(0, bill.amount - allocated);
      outstanding += remaining;
      if (remaining > 0) unpaidCount += 1;
    }
  }

  const totalPaid = user.villa?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const lastPayment = user.villa?.payments[0]?.paidAt ?? null;

  // ─── Build recent activity (interleave bills + payments) ───
  const billActivity = (user.villa?.maintenanceBills ?? []).map((b) => ({
    id: `bill-${b.id}`,
    type: "BILL" as const,
    description: `Maintenance bill — ${monthName(b.month)} ${b.year}`,
    amount: b.amount,
    date: b.createdAt,
    direction: "DEBIT" as const,
  }));

  const paymentActivity = (user.villa?.payments ?? []).map((p) => ({
    id: `payment-${p.id}`,
    type: "PAYMENT" as const,
    description: `Payment received (${p.method})${p.reference ? ` — ${p.reference}` : ""}`,
    amount: p.amount,
    date: p.paidAt,
    direction: "CREDIT" as const,
  }));

  const recentActivity = [...billActivity, ...paymentActivity]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    plotNumber: user.plotNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    villa: user.villa
      ? {
          id: user.villa.id,
          villaNo: user.villa.villaNo,
          areaInSqFt: user.villa.areaInSqFt,
          type: user.villa.type,
          ownerName: user.villa.ownerName,
        }
      : null,

    outstandingBalance: outstanding,
    totalPaid,
    totalDue,
    unpaidBillsCount: unpaidCount,
    lastPaymentDate: lastPayment,

    familyMembers: user.familyMembers,
    recentActivity,

    pendingRequestsCount: user._count.residentRequests,
    pendingPaymentRequestsCount: user._count.paymentRequestsSubmitted,
    accountStatus: user.accountStatus,
  };
}

// ─────────────────────────────────────────────────────────────
//  Available villas for linking (used in edit form)
// ─────────────────────────────────────────────────────────────

export async function getAvailableVillasForLinking(
  excludeUserId?: string,
): Promise<Array<{ id: string; villaNo: number; ownerName: string }>> {
  // Get all villas where userId is null (unclaimed) OR matches excludeUserId
  const villas = await prisma.villa.findMany({
    where: {
      OR: [
        { userId: null },
        ...(excludeUserId ? [{ userId: excludeUserId }] : []),
      ],
    },
    select: {
      id: true,
      villaNo: true,
      ownerName: true,
    },
    orderBy: { villaNo: "asc" },
  });
  return villas;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });
}
