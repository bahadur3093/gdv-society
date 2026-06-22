import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Inbox,
} from "lucide-react";
import type { PassbookEntry } from "@/lib/billing/getResidentLedger";
import Section from "@/components/organisms/Section";
import { cn, formatCurrency, formatDate } from "@/lib/utils/utils";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";

interface RecentActivityProps {
  entries: PassbookEntry[];
}

export default function RecentActivity({ entries }: RecentActivityProps) {
  return (
    <Section
      title="Recent Activity"
      description="Your last few transactions"
      action={
        <Link
          href={"/resident/ledger"}
          className={cn(
            "inline-flex items-center gap-1 text-body-sm font-medium",
            "text-brand-primary hover:underline",
            "transition-colors duration-(--duration-fast)",
          )}
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <Card padding="none">
        {entries.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<Inbox />}
            title="No transactions yet"
            description="Your bills and payments will appear here."
          />
        ) : (
          <ul className="divide-y divide-border-subtle">
            {entries.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </Card>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single activity row
// ─────────────────────────────────────────────────────────────

interface ActivityRowProps {
  entry: PassbookEntry;
}

function ActivityRow({ entry }: ActivityRowProps) {
  const config = getEntryConfig(entry);
  const Icon = config.icon;
  const isCredit = entry.direction === "CREDIT";

  return (
    <li className="flex items-center gap-3 md:gap-4 px-4 py-3.5 md:px-5 md:py-4">
      {/* Type icon */}
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          config.bg,
          config.fg,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-primary truncate">
          {entry.description}
        </p>
        <p className="text-body-sm text-text-muted mt-0.5">
          {formatDate(entry.date)}
          {entry.reference && (
            <span className="ml-2 text-text-disabled">• {entry.reference}</span>
          )}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "font-mono font-semibold text-body md:text-body-lg",
            isCredit ? "text-success" : "text-text-primary",
          )}
        >
          {isCredit ? "−" : "+"}
          {formatCurrency(entry.amount)}
        </p>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  Icon + color mapping per entry type
// ─────────────────────────────────────────────────────────────

function getEntryConfig(entry: PassbookEntry): {
  icon: typeof Receipt;
  bg: string;
  fg: string;
} {
  if (entry.type === "PAYMENT") {
    return {
      icon: CheckCircle2,
      bg: "bg-success/15",
      fg: "text-success",
    };
  }
  if (entry.type === "LEVY") {
    return {
      icon: AlertCircle,
      bg: "bg-warning/15",
      fg: "text-warning",
    };
  }
  if (entry.type === "ADJUSTMENT") {
    return {
      icon: Wallet,
      bg: "bg-info/15",
      fg: "text-info",
    };
  }
  // BILL
  return {
    icon: Receipt,
    bg: "bg-brand-primary/15",
    fg: "text-brand-primary",
  };
}
