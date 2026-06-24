import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/notifications/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    // Log every incoming update for debugging
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

    // Security: only respond to admin chat
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
        text: "⛔ <b>Not authorized</b>\n\nThis bot is restricted to a specific admin.",
        chatId,
      });

      return NextResponse.json({ ok: true });
    }

    const userText = message.text.trim();

    // Health check command
    if (userText === "/start" || userText === "/help") {
      await sendTelegram({
        text: [
          "👋 <b>GDV Society Bot</b>",
          "",
          "I can help you query society data. Try asking:",
          "",
          '• <i>"show pending users"</i>',
          '• <i>"any unpaid bills?"</i>',
          '• <i>"give me society stats"</i>',
          '• <i>"who lives in villa 39?"</i>',
          "",
          "Just type naturally — I'll figure out the rest.",
        ].join("\n"),
      });
      return NextResponse.json({ ok: true });
    }

    // Echo for now — will replace with LLM in Chunk 3
    await sendTelegram({
      text: [
        "⚙️ <b>Processing...</b>",
        "",
        `You said: <i>${escapeHtml(userText)}</i>`,
        "",
        "<i>LLM integration coming in next chunk.</i>",
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[telegram webhook] error:", e);
    // Always return 200 to Telegram so it doesn't retry
    return NextResponse.json({ ok: true });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
