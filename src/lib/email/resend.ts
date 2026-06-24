import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

// ─────────────────────────────────────────────────────────────
//  Resend client (singleton)
// ─────────────────────────────────────────────────────────────

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const fromName = process.env.RESEND_FROM_NAME ?? "GDV Society Hub";

if (!apiKey) {
  console.warn(
    "[email/resend] RESEND_API_KEY not set. Emails will be logged only.",
  );
}

const resend = apiKey ? new Resend(apiKey) : null;

// ─────────────────────────────────────────────────────────────
//  Send email
// ─────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  subject: string;
  /** React Email component to render as the body */
  react: ReactElement;
  /** Optional plain text fallback (auto-generated if missing) */
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  /** Resend message ID if sent */
  id?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Send an email via Resend.
 *
 * Behavior:
 * • If RESEND_API_KEY is set: actually sends the email
 * • If not set: logs the email content to console (dev fallback)
 *
 * Returns success status either way (won't throw).
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const { to, subject, react, text } = options;

  // Render React component to HTML and text
  const html = await render(react);
  const fallbackText = text ?? (await render(react, { plainText: true }));

  // ─── Dev fallback: log to console if Resend not configured ───
  if (!resend) {
    console.log(
      "\n" +
        "━".repeat(60) +
        "\n" +
        "📧 EMAIL (logged only — Resend not configured)\n" +
        "━".repeat(60) +
        "\n" +
        `   From:    ${fromName} <${fromEmail}>\n` +
        `   To:      ${to}\n` +
        `   Subject: ${subject}\n` +
        `   Body:    \n${fallbackText}\n` +
        "━".repeat(60) +
        "\n",
    );

    return { success: true, id: "logged-only" };
  }

  // ─── Send via Resend ───
  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
      text: fallbackText,
    });

    if (result.error) {
      console.error("[email/resend] Send failed:", result.error);
      return {
        success: false,
        error: result.error.message ?? "Unknown send error",
      };
    }

    // Audit log
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "email_sent",
        to,
        subject,
        messageId: result.data?.id,
      }),
    );

    return {
      success: true,
      id: result.data?.id,
    };
  } catch (error) {
    console.error("[email/resend] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
