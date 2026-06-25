import { NextResponse } from "next/server";
import { verifyAdminInitData } from "@/lib/telegram/verify-init-data";
import { getAdminUserForTelegram } from "@/lib/telegram/get-admin-user";
import {
  approveResidentCore,
  suspendResidentCore,
} from "@/lib/admin/resident-actions-core";
import {
  approvePaymentRequestCore,
  rejectPaymentRequestCore,
} from "@/lib/admin/payment-actions-core";

export const dynamic = "force-dynamic";

type Action =
  | "approve_user"
  | "suspend_user"
  | "approve_payment"
  | "reject_payment";

interface ActionRequest {
  initData: string;
  action: Action;
  targetId: string;
  reason?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ActionRequest;
    const { initData, action, targetId, reason } = body;

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    if (!action || !targetId) {
      return NextResponse.json(
        { error: "Missing action or targetId" },
        { status: 400 },
      );
    }

    const verified = await verifyAdminInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getAdminUserForTelegram();
    if (!admin) {
      return NextResponse.json(
        { error: "Admin user not found in database" },
        { status: 500 },
      );
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "telegram_admin_action",
        action,
        targetId,
        telegramUserId: verified.userId,
        adminUserId: admin.id,
      }),
    );

    let result;
    switch (action) {
      case "approve_user":
        result = await approveResidentCore(targetId);
        break;
      case "suspend_user":
        result = await suspendResidentCore(targetId, "via Telegram");
        break;
      case "approve_payment":
        result = await approvePaymentRequestCore(targetId, admin.id);
        break;
      case "reject_payment":
        if (!reason || !reason.trim()) {
          return NextResponse.json(
            { error: "Reason required for reject_payment" },
            { status: 400 },
          );
        }
        result = await rejectPaymentRequestCore(targetId, admin.id, reason);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("[telegram action] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
