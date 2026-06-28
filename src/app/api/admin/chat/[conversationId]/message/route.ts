import { NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  stepCountIs,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import { isValidModelId, DEFAULT_MODEL_ID } from "@/lib/chat/models";
import { tools } from "@/lib/ai/tools";
import { CHAT_SYSTEM_PROMPT } from "@/components/prompt/chat-thread";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ollama = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

const SYSTEM_PROMPT = CHAT_SYSTEM_PROMPT;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;

    const session = await auth();
    if (
      !session?.user?.id ||
      !session?.user?.email ||
      !isChatAllowedForEmail(session.user.email)
    ) {
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
      const text = textPart && "text" in textPart ? (textPart as any).text : "";

      if (text?.trim()) {
        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: "user",
            content: text.trim(),
            parts: lastUserMessage.parts as any,
          },
        });
      }
    }

    // ── Stream LLM ──
    const result = streamText({
      model: ollama.chat(selectedModel),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3),
    });

    // ── Convert to UI stream + persist final assistant message ──
    const uiStream = toUIMessageStream({
      stream: result.fullStream,
      onFinish: async ({ messages: uiMessages }) => {
        const lastAssistant = uiMessages.at(-1);

        if (lastAssistant?.role === "assistant") {
          const textPart = lastAssistant.parts?.find(
            (p: any) => p.type === "text",
          );
          const finalText =
            textPart && "text" in textPart ? (textPart as any).text : "";

          await prisma.chatMessage.create({
            data: {
              conversationId,
              role: "assistant",
              content: finalText?.trim() || "",
              parts: lastAssistant.parts as any,
            },
          });
        }

        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      },
    });

    return createUIMessageStreamResponse({ stream: uiStream });
  } catch (e) {
    console.error("[chat/message] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
