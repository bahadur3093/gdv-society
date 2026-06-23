// src/app/(authenticated)/admin/residents/[id]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/auth";
import {
  getAdminResidentDetail,
  getAvailableVillasForLinking,
} from "@/lib/users/getAdminResidents";
import ResidentHeader from "../_components/ResidentHeader";
import ResidentStats from "../_components/ResidentStats";
import ResidentVillaCard from "../_components/ResidentVillaCard";
import FamilyMembersList from "../_components/FamilyMembersList";
import RecentActivityList from "../_components/RecentActivityList";
import Button from "@/components/atoms/Button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const resident = await getAdminResidentDetail(id);
  return {
    title: resident ? `${resident.name} — Admin` : "Resident — Admin",
  };
}

export default async function ResidentDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  // Fetch in parallel
  const [resident, availableVillas] = await Promise.all([
    getAdminResidentDetail(id),
    getAvailableVillasForLinking(id),
  ]);

  if (!resident) {
    notFound();
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" icon={<ArrowLeft />}>
        <Link href={"/admin/residents"}>Back to residents</Link>
      </Button>

      {/* Header (now receives availableVillas for the edit form) */}
      <ResidentHeader resident={resident} availableVillas={availableVillas} />

      {/* Stats grid */}
      <ResidentStats resident={resident} />

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <RecentActivityList activity={resident.recentActivity} />
          <FamilyMembersList members={resident.familyMembers} />
        </div>

        <div className="lg:col-span-4">
          <ResidentVillaCard villa={resident.villa} />
        </div>
      </div>
    </div>
  );
}
