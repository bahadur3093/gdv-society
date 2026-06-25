import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminInitData } from "@/lib/telegram/verify-init-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    const verified = await verifyAdminInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pendingUsers, pendingPayments] = await Promise.all([
      prisma.user.findMany({
        where: { role: "RESIDENT", accountStatus: "PENDING" },
        select: {
          id: true,
          name: true,
          email: true,
          plotNumber: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.paymentRequest.findMany({
        where: { status: "PENDING" },
        select: {
          id: true,
          amount: true,
          method: true,
          reference: true,
          notes: true,
          submittedAt: true,
          villa: {
            select: {
              villaNo: true,
              ownerName: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      pendingUsers: pendingUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plotNumber: u.plotNumber,
        signedUpAt: u.createdAt.toISOString(),
      })),
      pendingPayments: pendingPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        notes: p.notes,
        submittedAt: p.submittedAt.toISOString(),
        villaNo: p.villa.villaNo,
        residentName: p.user.name,
        residentEmail: p.user.email,
      })),
      counts: {
        pendingUsers: pendingUsers.length,
        pendingPayments: pendingPayments.length,
        total: pendingUsers.length + pendingPayments.length,
      },
    });
  } catch (e) {
    console.error("[telegram inbox-data] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
