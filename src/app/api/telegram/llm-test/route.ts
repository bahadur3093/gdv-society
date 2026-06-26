import { generateText } from "ai";
import { telegramModel } from "@/lib/telegram/ai-provider";

export async function GET() {
  const { text } = await generateText({
    model: telegramModel,
    prompt: "Reply with exactly: pong",
  });
  return Response.json({ text });
}
