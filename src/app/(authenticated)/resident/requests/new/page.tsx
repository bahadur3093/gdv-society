import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireResident } from "@/lib/auth/auth";
import NewRequestForm from "../../_components/NewRequestForm";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  await requireResident();

  return (
    <div className="min-h-full pb-24">
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/resident/requests"
          className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-h2 font-bold text-text-primary">New Request</h1>
        <p className="text-body-sm text-text-muted mt-0.5">
          Tell us what you need help with.
        </p>
      </div>

      <div className="px-4">
        <NewRequestForm />
      </div>
    </div>
  );
}
