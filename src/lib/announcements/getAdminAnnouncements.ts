import 'server-only';
import { prisma } from '@/lib/prisma';

export interface AdminAnnouncementRow {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isActive: boolean;
  publishDate: Date;
  fileCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAnnouncementsCounts {
  all: number;
  active: number;
  inactive: number;
  critical: number;
}

export interface AdminAnnouncementsData {
  rows: AdminAnnouncementRow[];
  counts: AdminAnnouncementsCounts;
}

export async function getAdminAnnouncements(): Promise<AdminAnnouncementsData> {
  const announcements = await prisma.announcement.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      priority: true,
      isActive: true,
      publishDate: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { files: true },
      },
    },
    orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
  });

  const rows: AdminAnnouncementRow[] = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    priority: a.priority,
    isActive: a.isActive,
    publishDate: a.publishDate,
    fileCount: a._count.files,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  const counts: AdminAnnouncementsCounts = {
    all: rows.length,
    active: rows.filter((r) => r.isActive).length,
    inactive: rows.filter((r) => !r.isActive).length,
    critical: rows.filter((r) => r.priority === 'critical').length,
  };

  return { rows, counts };
}

/**
 * Single announcement fetch — used by edit page.
 * Returns null if not found.
 */
export async function getAnnouncementById(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      files: {
        select: { id: true, url: true, name: true },
      },
    },
  });
}