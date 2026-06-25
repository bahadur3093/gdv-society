import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminInitData } from '@/lib/telegram/verify-init-data';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const verified = await verifyAdminInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      pendingCount,
      unpaidVillasCount,
      totalResidents,
      bills,
      expensesThisMonth,
      latestPending,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'RESIDENT', accountStatus: 'PENDING' },
      }),
      prisma.villa.count({
        where: {
          isBillable: true,
          maintenanceBills: {
            some: { status: { in: ['PENDING', 'PARTIAL'] } },
          },
        },
      }),
      prisma.user.count({
        where: { role: 'RESIDENT', accountStatus: 'APPROVED' },
      }),
      prisma.maintenanceBill.findMany({
        where: { status: { in: ['PENDING', 'PARTIAL'] } },
        select: {
          amount: true,
          allocations: { select: { amount: true } },
        },
      }),
      prisma.monthlyExpense.findMany({
        where: { month: currentMonth, year: currentYear },
        select: { amount: true },
      }),
      prisma.user.findMany({
        where: { role: 'RESIDENT', accountStatus: 'PENDING' },
        select: {
          id: true,
          name: true,
          email: true,
          plotNumber: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalOutstanding = bills.reduce((sum, b) => {
      const paid = b.allocations.reduce((s, a) => s + a.amount, 0);
      return sum + Math.max(0, b.amount - paid);
    }, 0);

    const totalExpensesThisMonth = expensesThisMonth.reduce(
      (s, e) => s + e.amount,
      0
    );

    return NextResponse.json({
      stats: {
        pendingCount,
        unpaidVillasCount,
        totalResidents,
        totalOutstanding,
        expensesThisMonth: totalExpensesThisMonth,
        monthLabel: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      },
      latestPending: latestPending.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plotNumber: u.plotNumber,
        signedUpAt: u.createdAt.toISOString(),
      })),
      verifiedAs: {
        firstName: verified.firstName,
        username: verified.username,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}