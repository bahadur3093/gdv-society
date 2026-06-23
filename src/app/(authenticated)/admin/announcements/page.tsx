import { Megaphone, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/auth";
import { getAdminAnnouncements } from "@/lib/announcements/getAdminAnnouncements";
import PageHeader from "@/components/navigation/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = { title: "Announcements — Admin" };

export default async function AnnouncementsAdminPage() {
  await requireAdmin();
  const data = await getAdminAnnouncements();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
        }
        title="Announcements"
        description={
          data.counts.all === 0
            ? "No announcements yet — create the first one to keep residents informed."
            : `${data.counts.all} total · ${data.counts.active} active`
        }
        actions={
          <Button asChild icon={<Plus className="w-4 h-4" />}>
            <Link href={"/admin/announcements/new"}>New announcement</Link>
          </Button>
        }
      />

      <AnnouncementsListView rows={data.rows} counts={data.counts} />
    </div>
  );
}

// Required for the asChild + Link pattern in Button
import Link from "next/link";
import Button from "@/components/atoms/Button";
import AnnouncementsListView from "./_components/AnnouncementsListView";
