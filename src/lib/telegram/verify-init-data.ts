import "server-only";
import crypto from "crypto";

export interface VerifiedInitData {
  userId: number;
  firstName: string;
  username?: string;
  authDate: number;
}

/**
 * Verifies Telegram WebApp initData using HMAC.
 *
 * Telegram signs all initData with bot token. We re-compute the hash
 * and compare. If it matches, the data is authentic and came from Telegram.
 *
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export async function verifyInitData(
  initData: string,
): Promise<VerifiedInitData | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("[telegram verify] TELEGRAM_BOT_TOKEN not configured");
    return null;
  }

  if (!initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");
    if (!receivedHash) return null;

    // Remove hash before computing
    params.delete("hash");

    // Sort keys alphabetically and join as `key=value\n...`
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    // Secret key = HMAC-SHA256(botToken, 'WebAppData')
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Computed hash = HMAC-SHA256(dataCheckString, secretKey)
    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== receivedHash) {
      console.warn("[telegram verify] Hash mismatch");
      return null;
    }

    // Check auth_date — reject anything older than 24 hours
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
    if (ageSeconds > 24 * 60 * 60) {
      console.warn("[telegram verify] initData too old:", ageSeconds);
      return null;
    }

    // Parse user object from query
    const userRaw = params.get("user");
    if (!userRaw) return null;

    const user = JSON.parse(userRaw) as {
      id: number;
      first_name: string;
      username?: string;
    };

    return {
      userId: user.id,
      firstName: user.first_name,
      username: user.username,
      authDate,
    };
  } catch (e) {
    console.error("[telegram verify] parse error:", e);
    return null;
  }
}

/**
 * Verifies initData AND checks user is the configured admin.
 */
export async function verifyAdminInitData(
  initData: string,
): Promise<VerifiedInitData | null> {
  const verified = await verifyInitData(initData);
  if (!verified) return null;

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn("[telegram verify] TELEGRAM_ADMIN_CHAT_ID not configured");
    return null;
  }

  if (String(verified.userId) !== adminChatId) {
    console.warn(
      JSON.stringify({
        event: "telegram_tma_unauthorized",
        userId: verified.userId,
        username: verified.username,
      }),
    );
    return null;
  }

  return verified;
}
