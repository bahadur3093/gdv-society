import { NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  stepCountIs,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import { isValidModelId, DEFAULT_MODEL_ID } from "@/lib/chat/models";
import { tools } from "@/lib/ai/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ollama = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant for the GDV Society Hub admin.

You have access to these tools:
- getOutstandingBills: get outstanding maintenance bills for a villa number.

Use tools whenever current GDV Society data is required.

When a tool returns data, summarize it clearly for the admin.
Do not expose raw JSON unless asked.
Format currency as ₹X,XXX.
Use plain text.
Do not use markdown headers.

NEVER attempt to use shell, bash, python, code execution, or any tool not provided to you.`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;

    // ── Auth ──
    const session = await auth();
    if (!session?.user?.email || !isChatAllowedForEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Verify ownership ──
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      select: { id: true },
    });
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ── Parse body ──
    const body = await request.json();
    const { messages, model } = body as {
      messages: UIMessage[];
      model?: string;
    };

    const selectedModel =
      model && isValidModelId(model) ? model : DEFAULT_MODEL_ID;

    // ── Save last user message ──
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      const textPart = lastUserMessage.parts?.find((p) => p.type === "text");
      const text = textPart && "text" in textPart ? textPart.text : "";
      if (text) {
        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: "user",
            content: text,
          },
        });
      }
    }

    // ── Stream ──
    const result = streamText({
      model: ollama.chat(selectedModel),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3),
      onFinish: async ({ text }) => {
        const finalText =
          text?.trim() || "I'm not sure how to help with that. Try rephrasing.";
        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: "assistant",
            content: finalText,
          },
        });
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (e) {
    console.error("[chat/message] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
