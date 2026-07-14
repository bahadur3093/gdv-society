import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireResident } from "@/lib/auth/auth";
import { getRequestDetail } from "@/lib/helpdesk/queries";
import { canViewRequest } from "@/lib/helpdesk/access";
import RequestDetail from "../../_components/RequestDetail";

export const dynamic = "force-dynamic";

export default async function ResidentRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const user = await requireResident();

  const allowed = await canViewRequest(user, requestId);
  if (!allowed) notFound();

  const request = await getRequestDetail(requestId);
  if (!request) notFound();

  return (
    <div className="min-h-full pb-24">
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/resident/requests"
          className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to requests
        </Link>
      </div>

      <div className="px-4">
        <RequestDetail request={request} currentUserId={user.id} />
      </div>
    </div>
  );
}
