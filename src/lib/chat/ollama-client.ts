import "server-only";

const OLLAMA_BASE = "https://ollama.com/v1";
const API_KEY = process.env.OLLAMA_API_KEY;

export interface OllamaModelInfo {
  id: string;
  label: string;
}

/**
 * Fetch list of available models from Ollama Cloud.
 * Uses the OpenAI-compatible /models endpoint.
 */
export async function fetchOllamaModels(): Promise<OllamaModelInfo[]> {
  if (!API_KEY) {
    throw new Error("OLLAMA_API_KEY not configured");
  }

  const res = await fetch(`${OLLAMA_BASE}/models`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama /models returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  const list = (data.data ?? data.models ?? []) as Array<{
    id: string;
    name?: string;
  }>;

  return list.map((m) => ({
    id: m.id,
    label: humanLabel(m.id),
  }));
}

/**
 * Sends a minimal chat completion to test access to a model.
 * Returns:
 *   { ok: true } — model is accessible (free)
 *   { ok: false, reason: 'PAID' | 'ERROR', message } — failure
 */
export async function testOllamaModel(
  modelId: string,
): Promise<
  { ok: true } | { ok: false; reason: "PAID" | "ERROR"; message: string }
> {
  if (!API_KEY) {
    return { ok: false, reason: "ERROR", message: "API key not configured" };
  }

  try {
    const res = await fetch(`${OLLAMA_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "Reply with a single word: hi" }],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (res.ok) return { ok: true };

    const text = await res.text().catch(() => "");
    const lower = text.toLowerCase();

    // Detect subscription/payment errors
    if (
      res.status === 402 ||
      lower.includes("subscription") ||
      lower.includes("payment") ||
      lower.includes("upgrade") ||
      lower.includes("premium")
    ) {
      return {
        ok: false,
        reason: "PAID",
        message: text.slice(0, 300) || `HTTP ${res.status}`,
      };
    }

    return {
      ok: false,
      reason: "ERROR",
      message: text.slice(0, 300) || `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      ok: false,
      reason: "ERROR",
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

function humanLabel(id: string): string {
  // e.g. "gpt-oss:120b" → "GPT-OSS 120B"
  return id
    .split(":")
    .map((part) =>
      part
        .split(/[-_]/)
        .map((w) => (w.match(/^\d/) ? w.toUpperCase() : capitalize(w)))
        .join(" "),
    )
    .join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
