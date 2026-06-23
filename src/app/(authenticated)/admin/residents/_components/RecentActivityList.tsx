import { Receipt, CheckCircle2, History } from "lucide-react";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import { cn, formatCurrency, formatDate } from "@/lib/utils/utils";

interface Props {
  activity: AdminResidentDetail["recentActivity"];
}

export default function RecentActivityList({ activity }: Props) {
  return (
    <Section
      title="Recent Activity"
      description="Last 5 transactions"
      icon={<History />}
    >
      <Card padding="none">
        {activity.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<History className="w-full h-full" />}
            title="No activity yet"
            description="Bills and payments will appear here."
          />
        ) : (
          <ul className="divide-y divide-border-subtle">
            {activity.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </Card>
    </Section>
  );
}

interface EntryType {
  id: string;
  type: "BILL" | "PAYMENT";
  description: string;
  amount: number;
  date: Date;
  direction: "DEBIT" | "CREDIT";
}

function ActivityRow({ entry }: { entry: EntryType }) {
  const isCredit = entry.direction === "CREDIT";
  const Icon = isCredit ? CheckCircle2 : Receipt;

  return (
    <li className="flex items-center gap-3 md:gap-4 px-4 py-3.5 md:px-5 md:py-4">
      {/* Type icon */}
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isCredit
            ? "bg-success/15 text-success"
            : "bg-brand-primary/15 text-brand-primary",
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-primary truncate">
          {entry.description}
        </p>
        <p className="text-body-sm text-text-muted mt-0.5">
          {formatDate(entry.date)}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0">
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
