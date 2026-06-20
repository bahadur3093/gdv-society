import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getResidentLedger } from "@/lib/billing/getResidentLedger";
import { prisma } from "@/lib/prisma";
import AccountsLedger from "@/app/(authenticated)/resident/ledger/_components/LedgerTable";
import { requireAdmin } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminResidentLedgerPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  // Verify the user exists and is a resident
  const user = await prisma.user.findUnique({
    where: { id: id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "RESIDENT") {
    notFound();
  }

  const data = await getResidentLedger(id);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Back link */}
      <Link
        href="/admin/ledger"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Master Ledger
      </Link>

      {/* Reuse the same ledger view */}
      <AccountsLedger data={data} />
    </div>
  );
}
