import { Plus } from "lucide-react";
import Link from "next/link";

import { getMasterLedger } from "@/lib/billing/getMasterLedger";
import PageHeader from "@/components/navigation/PageHeader";
import { requireAdmin } from "@/lib/auth/auth";
import Button from "@/components/atoms/Button";
import MasterLedgerView from "./_components/MasterLedgerView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Ledger — Admin",
};

export default async function AdminMasterLedgerPage() {
  await requireAdmin();
  const data = await getMasterLedger();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ─── Page Header ─── */}
      <PageHeader
        title="Master Ledger"
        description={
          <>
            {data.summary.totalVillas} villas • {data.summary.billableVillas}{" "}
            billable • {data.summary.claimedVillas} claimed • Rate: ₹
            {data.ratePerSqFt}/sqft
          </>
        }
        actions={
          <Button asChild icon={<Plus className="w-4 h-4" />}>
            <Link href={"/admin/bills"}>Generate Bills</Link>
          </Button>
        }
      />

      {/* ─── Main client view (stats + table) ─── */}
      <MasterLedgerView
        rows={data.rows}
        summary={data.summary}
        ratePerSqFt={data.ratePerSqFt}
      />
    </div>
  );
}
