import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conv = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      select: { id: true },
    });
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.chatConversation.delete({ where: { id: conversationId } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[chat delete] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conv = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      select: { id: true },
    });
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, isPinned } = body as {
      title?: string;
      isPinned?: boolean;
    };

    const data: { title?: string; isPinned?: boolean } = {};

    if (typeof title === "string") {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 },
        );
      }
      if (trimmed.length > 100) {
        return NextResponse.json(
          { error: "Title too long (max 100 chars)" },
          { status: 400 },
        );
      }
      data.title = trimmed;
    }

    if (typeof isPinned === "boolean") {
      data.isPinned = isPinned;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.chatConversation.update({
      where: { id: conversationId },
      data,
      select: {
        id: true,
        title: true,
        isPinned: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[chat patch] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
