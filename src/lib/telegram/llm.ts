import "server-only";
import Groq from "groq-sdk";
import { getToolDefinitions, executeTool } from "./tools";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a helpful assistant for the GDV Society Hub admin.

You help the admin query and understand society data via Telegram. You have access to tools that fetch real data from the database.

Rules:
- Use tools whenever the user asks about residents, villas, bills, expenses, or society stats. Do not make up data.
- Keep responses concise — Telegram users skim, not read.
- Use simple HTML formatting: <b>bold</b>, <i>italic</i>, <code>monospace</code>. Telegram does not support markdown.
- Format currency as ₹X,XXX (Indian rupees, no decimals for whole numbers).
- For lists of more than ~10 items, summarize first then list highlights.
- Use emojis sparingly (1-2 per response max) to add visual hierarchy.
- Never use markdown asterisks, hashes, or pipes — only HTML tags.
- If a tool returns an error, explain plainly what failed; don't expose internal details.
- If the user asks something unrelated to society data, politely redirect them.

Format hints:
- New line between sections
- Use • for bullets (not - or *)
- Use HTML <b> for emphasis on labels like <b>Name:</b>`;

interface LLMResponse {
  text: string;
  toolsCalled: string[];
}

export async function processUserMessage(
  userMessage: string,
): Promise<LLMResponse> {
  const tools = getToolDefinitions();
  const toolsCalled: string[] = [];

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  // Allow up to 3 rounds of tool calling
  for (let round = 0; round < 3; round++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const choice = completion.choices[0];
    if (!choice) {
      return {
        text: "⚠️ <i>No response from model. Try rephrasing.</i>",
        toolsCalled,
      };
    }

    const message = choice.message;

    // No more tool calls → return final text
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return {
        text: message.content?.trim() || "⚠️ <i>Empty response.</i>",
        toolsCalled,
      };
    }

    // Add assistant message with tool calls to conversation
    messages.push({
      role: "assistant",
      content: message.content ?? "",
      tool_calls: message.tool_calls,
    });

    // Execute each tool call
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") continue;

      const name = toolCall.function.name;
      let args: Record<string, unknown> = {};

      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        // Malformed args from model
      }

      const result = await executeTool(name, args);
      toolsCalled.push(name);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.success
          ? result.data
          : `Error: ${result.error ?? "Unknown error"}`,
      });
    }
  }

  // Exhausted rounds
  return {
    text: "⚠️ <i>Reached max processing rounds without final answer. Try a simpler question.</i>",
    toolsCalled,
  };
}
