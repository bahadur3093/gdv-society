import ComingSoon from "@/components/templates/CommingSoon";
import { requireResident } from "@/lib/auth/auth";
import { UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Requests — GDV Resident Hub",
};

export default async function RequestsPage() {
  await requireResident();

  return (
    <ComingSoon
      icon={<UserCircle />}
      title="Requests settings coming soon"
      description="Update your personal info, contact details, family members, and notification preferences."
    />
  );
}
