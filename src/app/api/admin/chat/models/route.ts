import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await prisma.chatModel.findMany({
      orderBy: [{ status: "asc" }, { label: "asc" }],
    });

    return NextResponse.json({
      models: models.map((m) => ({
        ...m,
        lastTested: m.lastTested?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      counts: {
        total: models.length,
        free: models.filter((m) => m.status === "FREE").length,
        paid: models.filter((m) => m.status === "PAID").length,
        unknown: models.filter((m) => m.status === "UNKNOWN").length,
        error: models.filter((m) => m.status === "ERROR").length,
      },
    });
  } catch (e) {
    console.error("[models GET] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
