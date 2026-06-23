import { requireAdmin } from "@/lib/auth/auth";
import AnnouncementForm from "../_components/AnnouncementForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Announcement — Admin",
};

export default async function NewAnnouncementPage() {
  await requireAdmin();

  return <AnnouncementForm mode="create" />;
}
