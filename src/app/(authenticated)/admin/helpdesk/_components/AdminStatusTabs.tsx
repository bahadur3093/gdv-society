import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import { cn } from "@/lib/utils/utils";

type TabKey = "ALL" | "OPEN" | RequestStatus;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "OPEN", label: "Open" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ALL", label: "All" },
];

const BASE = "/admin/helpdesk";

function tabHref(key: TabKey): string {
  if (key === "OPEN") return BASE;
  return BASE + "?status=" + key;
}

export default function AdminStatusTabs({ current }: { current: TabKey }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {TABS.map((t) => {
        const isActive = t.key === current;
        return (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-body-sm font-medium border transition-colors",
              isActive
                ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                : "bg-bg-sunken text-text-muted border-border-subtle hover:text-text-primary",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export type { TabKey };
