import { NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import { isValidModelId, DEFAULT_MODEL_ID } from "@/lib/chat/models";

// 🆕 Import your chat tools here as you build them
// import { monthlyExpensesSummaryTool } from '@/lib/chat/tools/monthly-expenses-summary';
// import { highestOutstandingVillasTool } from '@/lib/chat/tools/highest-outstanding-villas';

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ollama = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant for the GDV Society Hub admin.

You have access to these tools:
- monthlyExpensesSummaryTool: get society expense breakdown by category for a given month
- highestOutstandingVillasTool: list villas with biggest unpaid amounts

Use a tool ONLY if the question matches its purpose.

For anything else (general questions, greetings, things not covered by tools),
ANSWER DIRECTLY from your own knowledge. Do NOT say "I don't have access" — 
just answer naturally as a helpful assistant.

NEVER attempt to use shell, bash, python, code execution, or any tool not listed above.

Respond concisely. Format currency as ₹X,XXX. Use plain text — no markdown headers.`;

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
      tools: {
        // 🆕 Register tools as you build them:
        // monthlyExpensesSummaryTool,
        // highestOutstandingVillasTool,
      },
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
