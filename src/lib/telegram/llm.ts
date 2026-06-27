import "server-only";
import {
  generateText,
  stepCountIs,
  NoSuchToolError,
  InvalidToolInputError,
} from "ai";
import { telegramModel } from "./ai-provider";
import { telegramTools } from "./tools";

const SYSTEM_PROMPT = `You are a helpful assistant for the GDV Society Hub admin.

You help the admin query and understand society data via Telegram. You have access to tools that fetch real data from the database.

Tool usage rules:
- Use tools whenever the user asks about residents, villas, bills, expenses, or society stats. Do not make up data.
- Call ONE tool at a time. Wait for the result, then respond OR call another tool only if needed.
- For ambiguous queries like "find resident John", call lookup_resident with that name. If multiple matches return, present them to the user — do NOT keep searching.
- After ONE successful tool call, immediately format the answer for the user. Do not call the same tool repeatedly.
- If a tool returns results, that is your final answer. Format and reply.
- If a tool returns "not found" or empty, tell the user and stop. Do not retry with variations unless the user asks.

Formatting rules:
- Keep responses concise — Telegram users skim, not read.
- Use simple HTML formatting: <b>bold</b>, <i>italic</i>, <code>monospace</code>. Telegram does not support markdown.
- Format currency as ₹X,XXX (Indian rupees, no decimals for whole numbers).
- For lists of more than ~10 items, summarize first then list highlights.
- Use emojis sparingly (1-2 per response max) to add visual hierarchy.
- Never use markdown asterisks, hashes, or pipes — only HTML tags.
- Use • for bullets (not - or *)
- Use HTML <b> for emphasis on labels like <b>Name:</b>

When unsure:
- If query is unclear, make your best interpretation and call ONE tool.
- If query is unrelated to society data, politely say you only help with society queries.`;

interface LLMResponse {
  text: string;
  toolsCalled: string[];
}

export async function processUserMessage(
  userMessage: string,
): Promise<LLMResponse> {
  const toolsCalled: string[] = [];

  try {
    const { text } = await generateText({
      model: telegramModel,
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      tools: telegramTools,
      stopWhen: stepCountIs(5),
      temperature: 0.3,
      onStepFinish: ({ toolCalls }) => {
        for (const call of toolCalls) {
          toolsCalled.push(call.toolName);
        }
      },
    });

    const finalText = text?.trim();
    if (!finalText) {
      return {
        text: "⚠️ <i>Empty response. Try rephrasing.</i>",
        toolsCalled,
      };
    }

    return { text: finalText, toolsCalled };
  } catch (err) {
    if (NoSuchToolError.isInstance(err)) {
      return {
        text: "⚠️ <i>Model tried to use an unknown tool. Try rephrasing.</i>",
        toolsCalled,
      };
    }
    if (InvalidToolInputError.isInstance(err)) {
      return {
        text: "⚠️ <i>Invalid input to a tool. Try rephrasing.</i>",
        toolsCalled,
      };
    }
    console.error("[telegram-llm] error:", err);
    return {
      text: "⚠️ <i>Something went wrong processing your message.</i>",
      toolsCalled,
    };
  }
}
