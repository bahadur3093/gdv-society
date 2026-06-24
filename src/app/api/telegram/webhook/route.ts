import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/notifications/telegram";
import { processUserMessage } from "@/lib/telegram/llm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TelegramUpdate;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "telegram_webhook_received",
        update_id: body.update_id,
        message_id: body.message?.message_id,
        from_chat_id: body.message?.chat?.id,
      }),
    );

    const message = body.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Security: admin chat only
    if (!adminChatId || chatId !== adminChatId) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "telegram_unauthorized_access",
          from_chat_id: chatId,
          from_username: message.from?.username,
        }),
      );

      await sendTelegram({
        text: "⛔ <b>Not authorized</b>",
        chatId,
      });

      return NextResponse.json({ ok: true });
    }

    const userText = message.text.trim();

    // Built-in commands
    if (userText === "/start" || userText === "/help") {
      await sendTelegram({
        text: [
          "👋 <b>GDV Society Bot</b>",
          "",
          "Ask me anything about your society. Examples:",
          "",
          '• <i>"show pending users"</i>',
          '• <i>"who has unpaid bills?"</i>',
          '• <i>"give me a quick overview"</i>',
          '• <i>"tell me about villa 39"</i>',
          '• <i>"find resident bahadur"</i>',
          "",
          "<i>Just type naturally — I'll figure it out.</i>",
        ].join("\n"),
      });
      return NextResponse.json({ ok: true });
    }

    // Send "typing" indicator via a placeholder message
    await sendTelegram({
      text: "<i>🤔 Thinking...</i>",
    });

    try {
      const response = await processUserMessage(userText);

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "telegram_llm_response",
          tools_called: response.toolsCalled,
          response_length: response.text.length,
        }),
      );

      await sendTelegram({ text: response.text });
    } catch (llmError) {
      console.error("[telegram webhook] LLM error:", llmError);
      await sendTelegram({
        text: "⚠️ <i>Something went wrong processing your request. Try again or rephrase.</i>",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[telegram webhook] error:", e);
    return NextResponse.json({ ok: true });
  }
}
