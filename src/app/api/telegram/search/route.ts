import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminInitData } from '@/lib/telegram/verify-init-data';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;
    const query = ((body.query as string) ?? '').trim();

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const verified = await verifyAdminInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (query.length < 2) {
      return NextResponse.json({
        residents: [],
        villas: [],
        empty: true,
      });
    }

    // Search residents (by name or email)
    const residents = await prisma.user.findMany({
      where: {
        role: 'RESIDENT',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        plotNumber: true,
        accountStatus: true,
        villa: {
          select: {
            villaNo: true,
            areaInSqFt: true,
            maintenanceBills: {
              where: { status: { in: ['PENDING', 'PARTIAL'] } },
              select: {
                amount: true,
                allocations: { select: { amount: true } },
              },
            },
          },
        },
      },
      take: 10,
    });

    // Search villas (by number — accept numeric input)
    const villaNo = parseInt(query, 10);
    const villas = !isNaN(villaNo)
      ? await prisma.villa.findMany({
          where: { villaNo },
          select: {
            id: true,
            villaNo: true,
            ownerName: true,
            areaInSqFt: true,
            isBillable: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            maintenanceBills: {
              where: { status: { in: ['PENDING', 'PARTIAL'] } },
              select: {
                amount: true,
                allocations: { select: { amount: true } },
              },
            },
          },
          take: 5,
        })
      : [];

    return NextResponse.json({
      residents: residents.map((r) => {
        let outstanding = 0;
        if (r.villa) {
          for (const bill of r.villa.maintenanceBills) {
            const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
            outstanding += Math.max(0, bill.amount - paid);
          }
        }
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          plotNumber: r.plotNumber,
          accountStatus: r.accountStatus,
          villaNo: r.villa?.villaNo ?? null,
          outstanding,
        };
      }),
      villas: villas.map((v) => {
        let outstanding = 0;
        for (const bill of v.maintenanceBills) {
          const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
          outstanding += Math.max(0, bill.amount - paid);
        }
        return {
          id: v.id,
          villaNo: v.villaNo,
          ownerName: v.ownerName,
          areaInSqFt: v.areaInSqFt,
          isBillable: v.isBillable,
          residentName: v.user?.name ?? null,
          residentEmail: v.user?.email ?? null,
          residentId: v.user?.id ?? null,
          outstanding,
        };
      }),
      empty: residents.length === 0 && villas.length === 0,
    });
  } catch (e) {
    console.error('[telegram search] error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}