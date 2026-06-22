import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import Card, { CardBody, CardHeader } from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import { cn, formatRelativeTime } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";

interface AnnouncementPreview {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: Date;
}

interface AnnouncementsCardProps {
  announcement: AnnouncementPreview | null;
}

export default function AnnouncementsCard({
  announcement,
}: AnnouncementsCardProps) {
  if (!announcement) {
    return (
      <Card padding="md">
        <CardHeader title="Announcements" size="sm" />
        <EmptyState
          size="sm"
          icon={<Megaphone />}
          title="All quiet"
          description="No announcements right now."
        />
      </Card>
    );
  }

  // Truncate content to ~2 lines for preview
  const snippet = truncate(announcement.content, 120);

  return (
    <Card padding="md">
      <CardHeader
        title="Latest Announcement"
        size="sm"
        action={
          <Link
            href={"/resident/announcements"}
            className={cn(
              "inline-flex items-center gap-1 text-body-sm font-medium",
              "text-brand-primary hover:underline",
            )}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardBody>
        <Link
          href={`/resident/announcements/${announcement.id}`}
          className={cn(
            "group block -mx-2 -my-1 px-2 py-1 rounded-md",
            "hover:bg-bg-sunken/50",
            "transition-colors duration-(--duration-fast)",
            "focus-visible:outline-none focus-visible:bg-bg-sunken/50",
          )}
        >
          {/* Category + priority badges */}
          <div className="flex items-center gap-2 mb-2">
            <Badge size="sm" variant="brand" outline>
              {announcement.category}
            </Badge>
            {(announcement.priority === "high" ||
              announcement.priority === "critical") && (
              <Badge
                size="sm"
                variant={
                  announcement.priority === "critical" ? "danger" : "warning"
                }
              >
                {announcement.priority === "critical" ? "Critical" : "High"}
              </Badge>
            )}
          </div>

          {/* Title */}
          <p
            className={cn(
              "text-body font-semibold text-text-primary",
              "group-hover:text-brand-primary",
              "transition-colors duration-(--duration-fast)",
            )}
          >
            {announcement.title}
          </p>

          {/* Snippet */}
          <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">
            {snippet}
          </p>

          {/* Time */}
          <p className="text-micro uppercase text-text-muted mt-3 tracking-wider">
            {formatRelativeTime(announcement.publishDate)}
          </p>
        </Link>
      </CardBody>
    </Card>
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
