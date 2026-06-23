import { UserCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireResident } from "@/lib/auth/auth";
import { getResidentProfile } from "@/lib/users/getResidentProfile";
import { notFound } from "next/navigation";
import PageHeader from "@/components/navigation/PageHeader";
import Button from "@/components/atoms/Button";
import ProfileVillaCard from "./_components/ProfileVillaCard";
import ProfileInfoCard from "./_components/ProfileInfoCard";
import FamilyMembersSection from "./_components/FamilyMembersSection";
import AccountSection from "./_components/AccountSection";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profile — GDV Resident Hub" };

export default async function ResidentProfilePage() {
  const user = await requireResident();
  const profile = await getResidentProfile(user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" icon={<ArrowLeft />}>
        <Link href={"/resident"}>Back to dashboard</Link>
      </Button>

      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
        }
        title="Profile"
        description="Manage your account, family members, and preferences"
      />

      <ProfileInfoCard user={profile.user} />

      <ProfileVillaCard villa={profile.villa} />

      <FamilyMembersSection members={profile.familyMembers} />

      <AccountSection email={profile.user.email} />
    </div>
  );
}
