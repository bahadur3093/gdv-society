import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/auth';
import { getAnnouncementById } from '@/lib/announcements/getAdminAnnouncements';
import AnnouncementForm from '../../_components/AnnouncementForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Announcement — Admin',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <AnnouncementForm
      mode="edit"
      initialValues={{
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        publishDate: announcement.publishDate,
        isActive: announcement.isActive,
      }}
    />
  );
}