import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const firstMessage =
      (body.firstMessage as string | undefined)?.trim() ?? "";

    const conversation = await prisma.chatConversation.create({
      data: {
        userId: session.user.id,
        title: firstMessage ? firstMessage.slice(0, 50) : "New chat",
      },
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (e) {
    console.error("[chat/new] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
