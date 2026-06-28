import ToolCard from "../ToolCard";
import DataList from "../primitives/DataList";
import DataRow from "../primitives/DataRow";
import StatPill from "../primitives/StatPill";
import AmountText from "../primitives/AmountText";
import StatusBadge from "../primitives/StatusBadge";
import EmptyState from "../primitives/EmptyState";
import { Receipt } from "lucide-react";

interface Bill {
  month: number;
  year: number;
  amount: number;
  status: "PENDING" | "PARTIAL" | "PAID";
}

export default function OutstandingBillsView({
  count,
  bills,
}: {
  count: number;
  bills: Bill[];
}) {
  if (count === 0) {
    return (
      <ToolCard
        title="Outstanding Bills"
        icon={<Receipt className="w-4 h-4" />}
      >
        <EmptyState message="No outstanding bills 🎉" />
      </ToolCard>
    );
  }

  const total = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <ToolCard title="Outstanding Bills" icon={<Receipt className="w-4 h-4" />}>
      <div className="grid grid-cols-2 gap-2">
        <StatPill label="Bills" value={count} tone="warning" />
        <StatPill
          label="Total Due"
          value={<AmountText value={total} />}
          tone="danger"
        />
      </div>

      <DataList>
        {bills.map((b, i) => (
          <DataRow
            key={i}
            label={`${b.month}/${b.year}`}
            value={
              <span className="flex items-center gap-2">
                <AmountText value={b.amount} />
                <StatusBadge status={b.status} />
              </span>
            }
          />
        ))}
      </DataList>
    </ToolCard>
  );
}
