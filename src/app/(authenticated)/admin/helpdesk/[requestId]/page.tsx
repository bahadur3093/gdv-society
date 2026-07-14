import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/auth";
import { getRequestDetail } from "@/lib/helpdesk/queries";
import AdminRequestDetail from "../_components/AdminRequestDetail";

export const dynamic = "force-dynamic";

export default async function AdminHelpdeskDetailPage(props: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await props.params;
  const admin = await requireAdmin();

  const request = await getRequestDetail(requestId);
  if (!request) notFound();

  return (
    <div className="min-h-full pb-24 p-4 md:p-6 space-y-4">
      <Link
        href={"/admin/helpdesk"}
        className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to helpdesk
      </Link>

      <AdminRequestDetail request={request} currentUserId={admin.id} />
    </div>
  );
}
