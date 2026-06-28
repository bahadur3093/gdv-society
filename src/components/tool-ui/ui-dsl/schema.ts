export type Tone =
  | "default"
  | "danger"
  | "success"
  | "warning"

export type Badge = {
  text: string;
  tone?: Tone;
};

export type UIBlock =
  | { type: "card"; title?: string; icon?: IconName; blocks: UIBlock[] }
  | { type: "section"; title?: string; blocks: UIBlock[] }
  | { type: "text"; text: string; tone?: Tone; bold?: boolean }
  | { type: "stat"; label: string; value: string; tone?: Tone }
  | { type: "stat-grid"; columns?: 2 | 3 | 4; items: UIBlock[] }
  | { type: "row"; label: string; value: string; badge?: Badge }
  | { type: "list"; items: UIBlock[] }
  | { type: "kv"; pairs: { label: string; value: string; badge?: Badge }[] }
  | { type: "divider" }
  | { type: "empty"; message: string; icon?: IconName }
  | { type: "alert"; tone: Tone; title?: string; message: string };

export type IconName =
  | "Receipt"
  | "Wallet"
  | "AlertTriangle"
  | "CheckCircle2"
  | "Info"
  | "Users"
  | "Home"
  | "Megaphone"
  | "TrendingUp"
  | "TrendingDown";

export type ToolResult<TData = unknown> = {
  data: TData; // raw machine-readable
  ui: UIBlock; // for renderer
  summary?: string; // optional 1-line for the LLM to read
};
