import type { UIBlock, IconName, Tone, Badge } from "./schema";

export const ui = {
  card: (title: string, icon: IconName, blocks: UIBlock[]): UIBlock =>
    ({ type: "card", title, icon, blocks }),

  text: (text: string, opts: { tone?: Tone; bold?: boolean } = {}): UIBlock =>
    ({ type: "text", text, ...opts }),

  stat: (label: string, value: string, tone?: Tone): UIBlock =>
    ({ type: "stat", label, value, tone }),

  statGrid: (items: UIBlock[], columns: 2 | 3 | 4 = 2): UIBlock =>
    ({ type: "stat-grid", items, columns }),

  row: (label: string, value: string, badge?: Badge): UIBlock =>
    ({ type: "row", label, value, badge }),

  list: (items: UIBlock[]): UIBlock => ({ type: "list", items }),

  kv: (pairs: { label: string; value: string; badge?: Badge }[]): UIBlock =>
    ({ type: "kv", pairs }),

  empty: (message: string, icon?: IconName): UIBlock =>
    ({ type: "empty", message, icon }),

  alert: (tone: Tone, message: string, title?: string): UIBlock =>
    ({ type: "alert", tone, message, title }),

  divider: (): UIBlock => ({ type: "divider" }),
};

export const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const monthName = (m: number, y: number) => {
  const names = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return `${names[m - 1]} ${y}`;
};