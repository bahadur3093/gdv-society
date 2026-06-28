import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import { testOllamaModel } from "@/lib/chat/ollama-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedId = decodeURIComponent(id);
    const model = await prisma.chatModel.findUnique({
      where: { id: decodedId },
    });
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const result = await testOllamaModel(decodedId);

    const updated = await prisma.chatModel.update({
      where: { id: decodedId },
      data: {
        status: result.ok ? "FREE" : result.reason,
        lastTested: new Date(),
        lastError: result.ok ? null : result.message,
      },
    });

    return NextResponse.json({
      success: true,
      model: {
        ...updated,
        lastTested: updated.lastTested?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[models/test] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
