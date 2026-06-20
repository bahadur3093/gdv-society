// app/(authenticated)/(admin)/admin/ledger/[userId]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getResidentLedger } from "@/lib/billing/getResidentLedger";
import { requireAdmin } from "@/lib/auth/auth";
import AccountsLedger from "@/app/(authenticated)/resident/ledger/_components/AccountsLedger";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminResidentLedgerPage({ params }: PageProps) {
  await requireAdmin();

  const { userId } = await params;

  // Verify the user exists and is a resident
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "RESIDENT") {
    notFound();
  }

  const data = await getResidentLedger(userId);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Back link */}
      <Link
        href="/admin/ledger"
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to master ledger
      </Link>

      {/* Shared ledger view */}
      <AccountsLedger data={data} />
    </div>
  );
}
