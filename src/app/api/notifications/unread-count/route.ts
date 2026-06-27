import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    console.log("[unread-count] session:", {
      id: session?.user?.id,
      email: session?.user?.email,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (e) {
    console.error("[unread-count GET] error:", e);
    return NextResponse.json({ unreadCount: 0 });
  }
}
