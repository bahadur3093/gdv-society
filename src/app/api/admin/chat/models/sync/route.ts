import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import { fetchOllamaModels } from "@/lib/chat/ollama-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fetched = await fetchOllamaModels();

    let added = 0;
    let updated = 0;

    for (const m of fetched) {
      const existing = await prisma.chatModel.findUnique({
        where: { id: m.id },
      });
      if (existing) {
        // Only update label if it changed — preserve status/test data
        if (existing.label !== m.label) {
          await prisma.chatModel.update({
            where: { id: m.id },
            data: { label: m.label },
          });
          updated++;
        }
      } else {
        await prisma.chatModel.create({
          data: {
            id: m.id,
            label: m.label,
            status: "UNKNOWN",
          },
        });
        added++;
      }
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      total: fetched.length,
    });
  } catch (e) {
    console.error("[models/sync] error:", e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
