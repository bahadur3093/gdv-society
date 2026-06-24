import "server-only";

interface SendTelegramOptions {
  text: string;
  buttons?: Array<{ text: string; url: string }>;
  chatId?: string;
}

interface SendTelegramResult {
  success: boolean;
  error?: string;
}

export async function sendTelegram(
  options: SendTelegramOptions,
): Promise<SendTelegramResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId ?? process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn(
      "[telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID. Skipping.",
    );
    return { success: false, error: "not_configured" };
  }

  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: options.text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    if (options.buttons && options.buttons.length > 0) {
      body.reply_markup = {
        inline_keyboard: [
          options.buttons.map((b) => ({ text: b.text, url: b.url })),
        ],
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[telegram] Send failed:", response.status, errorBody);
      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[telegram] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
