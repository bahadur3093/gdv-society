import ComingSoon from "@/components/templates/CommingSoon";
import { requireResident } from "@/lib/auth/auth";
import { UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Expenses — GDV Resident Hub",
};

export default async function ExpensesPage() {
  await requireResident();

  return (
    <ComingSoon
      icon={<UserCircle />}
      title="Expenses settings coming soon"
      description="Update your personal info, contact details, family members, and notification preferences."
    />
  );
}
