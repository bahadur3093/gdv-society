import Link from "next/link";
import { History, ChevronRight, Receipt } from "lucide-react";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";

interface Group {
  month: number;
  year: number;
  count: number;
  total: number;
  latest: Date;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Props {
  groups: Group[];
}

export default function RecentGenerations({ groups }: Props) {
  return (
    <Section
      title="Recent Generations"
      description="Last 6 billing cycles"
      icon={<History />}
    >
      {groups.length === 0 ? (
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<Receipt />}
            title="No bills generated yet"
            description="When you generate your first bills, they'll show up here."
          />
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {groups.map((group) => (
              <GenerationRow
                key={`${group.year}-${group.month}`}
                group={group}
              />
            ))}
          </ul>
        </Card>
      )}
    </Section>
  );
}

function GenerationRow({ group }: { group: Group }) {
  // Current month special tag
  const now = new Date();
  const isCurrent =
    group.month === now.getMonth() + 1 && group.year === now.getFullYear();

  return (
    <li>
      <Link
        href={`/admin/bills?month=${group.month}&year=${group.year}`}
        className={cn(
          "group flex items-center gap-4",
          "px-4 py-3 md:px-5 md:py-4",
          "hover:bg-bg-sunken/50",
          "transition-colors duration-(--duration-fast)",
          "focus-visible:outline-none focus-visible:bg-bg-sunken/50",
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-md flex items-center justify-center",
            "bg-brand-primary/10 text-brand-primary",
          )}
        >
          <Receipt className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-body font-medium text-text-primary">
              {MONTHS[group.month - 1]} {group.year}
            </p>
            {isCurrent && (
              <Badge size="sm" variant="brand" outline>
                Current
              </Badge>
            )}
          </div>
          <p className="text-body-sm text-text-muted mt-0.5">
            {group.count} bill{group.count === 1 ? "" : "s"} •{" "}
            {formatRelativeTime(group.latest)}
          </p>
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-body font-mono font-semibold text-text-primary">
            {formatCurrency(group.total)}
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            "w-4 h-4 text-text-muted shrink-0",
            "transition-transform duration-(--duration-fast)",
            "group-hover:translate-x-0.5",
          )}
        />
      </Link>
    </li>
  );
}
