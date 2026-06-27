import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { prisma } from '@/lib/prisma';import { requireResident } from '@/lib/auth/auth';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import { cn, formatDateTime } from '@/lib/utils/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  await requireResident();
  const { id } = await params;

  const announcement = await prisma.announcement.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      priority: true,
      publishDate: true,
      files: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <>
    
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        icon={<ArrowLeft className="w-4 h-4" />}
      >
        <Link href={"/resident/announcements"}>Back to announcements</Link>
      </Button>

      <Card padding="lg">
        {/* Category + priority */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="brand" outline icon={<Megaphone className="w-3 h-3" />}>
            {announcement.category}
          </Badge>
          {(announcement.priority === 'high' || announcement.priority === 'critical') && (
            <Badge
              variant={announcement.priority === 'critical' ? 'danger' : 'warning'}
            >
              {announcement.priority === 'critical' ? 'Critical' : 'High Priority'}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-h1 text-text-primary">{announcement.title}</h1>

        {/* Posted date */}
        <p className="text-body-sm text-text-muted mt-2">
          Posted {formatDateTime(announcement.publishDate)}
        </p>

        {/* Content */}
        <div className={cn(
          'mt-6 text-body text-text-primary',
          'whitespace-pre-wrap', // preserve line breaks from textarea input
          'leading-relaxed'
        )}>
          <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
        </div>

        {/* Attachments (if any) */}
        {announcement.files.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="text-body-sm font-semibold text-text-primary mb-3">
              Attachments ({announcement.files.length})
            </p>
            <ul className="space-y-2">
              {announcement.files.map((file) => (
                <li key={file.id}>
                  <a href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-md',
                      'bg-bg-sunken text-text-primary border border-border-subtle',
                      'hover:bg-bg-elevated transition-colors duration-(--duration-fast)',
                      'text-body-sm'
                    )}
                  >
                    📎 {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
    </>
  );
}