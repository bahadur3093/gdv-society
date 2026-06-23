import { Wallet, CheckCircle2, Users, MessageSquare } from "lucide-react";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import StatCard from "@/components/molecules/StatCard";

interface Props {
  resident: AdminResidentDetail;
}

export default function ResidentStats({ resident }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        label="Outstanding"
        value={resident.outstandingBalance}
        format="currency-compact"
        description={
          resident.unpaidBillsCount > 0
            ? `${resident.unpaidBillsCount} unpaid bill${
                resident.unpaidBillsCount === 1 ? "" : "s"
              }`
            : "All bills paid"
        }
        icon={<Wallet />}
        accent={resident.outstandingBalance > 0 ? "warning" : "success"}
      />

      <StatCard
        label="Total Paid"
        value={resident.totalPaid}
        format="currency-compact"
        description={`Of ${formatCompact(resident.totalDue)} billed`}
        icon={<CheckCircle2 />}
        accent="success"
      />

      <StatCard
        label="Family Members"
        value={resident.familyMembers.length}
        format="number"
        description="Registered with account"
        icon={<Users />}
        accent="brand"
      />

      <StatCard
        label="Open Requests"
        value={
          resident.pendingRequestsCount + resident.pendingPaymentRequestsCount
        }
        format="number"
        description={
          resident.pendingPaymentRequestsCount > 0
            ? `${resident.pendingPaymentRequestsCount} payment review`
            : "Pending admin action"
        }
        icon={<MessageSquare />}
        accent={
          resident.pendingRequestsCount + resident.pendingPaymentRequestsCount >
          0
            ? "warning"
            : "neutral"
        }
      />
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n}`;
}
