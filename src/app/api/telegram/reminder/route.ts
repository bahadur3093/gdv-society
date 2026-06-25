import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminInitData } from "@/lib/telegram/verify-init-data";
import { sendEmail } from "@/lib/email/resend";
import PaymentReminderEmail from "@/emails/PaymentReminderEmail";

export const dynamic = "force-dynamic";

const REMINDER_COOLDOWN_HOURS = 12;

const lastReminderSent = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;
    const residentId = body.residentId as string | undefined;

    if (!initData || !residentId) {
      return NextResponse.json(
        { error: "Missing initData or residentId" },
        { status: 400 },
      );
    }

    const verified = await verifyAdminInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cooldown check
    const lastSent = lastReminderSent.get(residentId);
    if (lastSent) {
      const hoursSince = (Date.now() - lastSent) / (1000 * 60 * 60);
      if (hoursSince < REMINDER_COOLDOWN_HOURS) {
        const hoursLeft = Math.ceil(REMINDER_COOLDOWN_HOURS - hoursSince);
        return NextResponse.json({
          status: "error",
          message: `Reminder already sent. Wait ${hoursLeft}h before sending again.`,
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: residentId },
      select: {
        id: true,
        name: true,
        email: true,
        accountStatus: true,
        villa: {
          select: {
            villaNo: true,
            maintenanceBills: {
              where: { status: { in: ["PENDING", "PARTIAL"] } },
              select: {
                amount: true,
                allocations: { select: { amount: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Resident not found" },
        { status: 404 },
      );
    }

    if (user.accountStatus !== "APPROVED") {
      return NextResponse.json({
        status: "error",
        message: "Resident account is not active",
      });
    }

    // Compute outstanding
    let outstanding = 0;
    if (user.villa) {
      for (const bill of user.villa.maintenanceBills) {
        const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
        outstanding += Math.max(0, bill.amount - paid);
      }
    }

    if (outstanding <= 0) {
      return NextResponse.json({
        status: "error",
        message: "No outstanding balance — nothing to remind about",
      });
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
    const payUrl = `${baseUrl}/resident/pay`;

    const result = await sendEmail({
      to: user.email,
      subject: `Reminder: ₹${outstanding.toLocaleString("en-IN")} outstanding`,
      react: PaymentReminderEmail({
        residentName: user.name,
        villaNo: user.villa?.villaNo ?? null,
        outstandingAmount: outstanding,
        payUrl,
      }),
    });

    if (!result.success) {
      return NextResponse.json({
        status: "error",
        message: result.error ?? "Failed to send email",
      });
    }

    // Set cooldown
    lastReminderSent.set(residentId, Date.now());

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "payment_reminder_sent",
        residentId,
        residentEmail: user.email,
        outstandingAmount: outstanding,
        adminTelegramUserId: verified.userId,
      }),
    );

    return NextResponse.json({
      status: "success",
      message: `Reminder sent to ${user.name} (₹${outstanding.toLocaleString("en-IN")})`,
    });
  } catch (e) {
    console.error("[telegram reminder] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
