import { Megaphone } from "lucide-react";

import { prisma } from "@/lib/prisma";

import Link from "next/link";
import Card, { CardBody } from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import Badge from "@/components/atoms/Badge";
import { requireResident } from "@/lib/auth/auth";
import { formatRelativeTime } from "@/lib/utils/utils";
import DOMPurify from 'dompurify';

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Announcements — GDV Resident Hub",
};

export default async function AnnouncementsPage() {
  await requireResident();

  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { publishDate: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      priority: true,
      publishDate: true,
    },
  });

  if (announcements.length === 0) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={<Megaphone />}
          title="No announcements yet"
          description="Society announcements and notices will appear here when posted."
          tone="info"
          size="lg"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary">Announcements</h1>
        <p className="text-body text-text-secondary mt-2">
          {announcements.length}{" "}
          {announcements.length === 1 ? "announcement" : "announcements"} from
          your society
        </p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {announcements.map((a) => (
          <Link
            key={a.id}
            href={`/resident/announcements/${a.id}`}
            className="block group"
          >
            <Card padding="md" interactive>
              <CardBody>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge size="sm" variant="brand" outline>
                    {a.category}
                  </Badge>
                  {(a.priority === "high" || a.priority === "critical") && (
                    <Badge
                      size="sm"
                      variant={a.priority === "critical" ? "danger" : "warning"}
                    >
                      {a.priority === "critical" ? "Critical" : "High"}
                    </Badge>
                  )}
                </div>

                <h3 className="text-h4 text-text-primary group-hover:text-brand-primary transition-colors duration-(--duration-fast)">
                  {a.title}
                </h3>

                <div className="text-body-sm text-text-secondary mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: a.content }} />

                <p className="text-micro uppercase text-text-muted mt-3 tracking-wider">
                  {formatRelativeTime(a.publishDate)}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
