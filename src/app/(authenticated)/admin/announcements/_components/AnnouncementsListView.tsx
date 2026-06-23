"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import {
  toggleAnnouncementActiveAction,
  deleteAnnouncementAction,
} from "../actions";
import type {
  AdminAnnouncementRow,
  AdminAnnouncementsCounts,
} from "@/lib/announcements/getAdminAnnouncements";
import Tabs, { TabItem } from "@/components/molecules/Tabs";
import { toast } from "@/components/atoms/Toast";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import { cn, formatRelativeTime } from "@/lib/utils/utils";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "CRITICAL";

interface Props {
  rows: AdminAnnouncementRow[];
  counts: AdminAnnouncementsCounts;
}

export default function AnnouncementsListView({ rows, counts }: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncementRow | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Filter rows ───
  const filtered = useMemo(() => {
    switch (filter) {
      case "ACTIVE":
        return rows.filter((r) => r.isActive);
      case "INACTIVE":
        return rows.filter((r) => !r.isActive);
      case "CRITICAL":
        return rows.filter((r) => r.priority === "critical");
      case "ALL":
      default:
        return rows;
    }
  }, [rows, filter]);

  // ─── Tabs config ───
  const tabs: TabItem[] = [
    {
      key: "ALL",
      label: "All",
      badge:
        counts.all > 0
          ? { label: String(counts.all), variant: "neutral" }
          : undefined,
    },
    {
      key: "ACTIVE",
      label: "Active",
      icon: <Eye />,
      badge:
        counts.active > 0
          ? { label: String(counts.active), variant: "success" }
          : undefined,
    },
    {
      key: "INACTIVE",
      label: "Inactive",
      icon: <EyeOff />,
      badge:
        counts.inactive > 0
          ? { label: String(counts.inactive), variant: "neutral" }
          : undefined,
    },
    {
      key: "CRITICAL",
      label: "Critical",
      icon: <AlertCircle />,
      badge:
        counts.critical > 0
          ? { label: String(counts.critical), variant: "danger" }
          : undefined,
    },
  ];

  // ─── Action handlers ───
  const handleToggleActive = async (id: string) => {
    const result = await toggleAnnouncementActiveAction(id);
    if (result.status === "success") {
      toast.success(result.message ?? "Status updated");
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAnnouncementAction(deleteTarget.id);
    setIsDeleting(false);
    if (result.status === "success") {
      toast.success(result.message ?? "Deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  };

  // ─── Columns ───
  const columns: ProTableColumn<AdminAnnouncementRow>[] = useMemo(
    () => [
      {
        key: "title",
        label: "Title",
        sortable: true,
        sortAccessor: (r) => r.title,
        desktop: (r) => (
          <div className="min-w-0">
            <div
              className={cn(
                "font-medium truncate",
                r.isActive ? "text-text-primary" : "text-text-muted",
              )}
            >
              {r.title}
            </div>
            <div className="text-text-muted text-xs mt-0.5 line-clamp-1">
              {stripHtml(r.content).slice(0, 100)}
              {stripHtml(r.content).length > 100 ? "…" : ""}
            </div>
          </div>
        ),
        mobilePrimary: (r) => r.title,
        mobileSecondary: (r) => stripHtml(r.content).slice(0, 60),
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        sortAccessor: (r) => r.category,
        desktop: (r) => (
          <Badge variant="info" outline size="sm">
            {r.category}
          </Badge>
        ),
        hideOn: ["mobile"],
      },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        sortAccessor: (r) => priorityRank(r.priority),
        desktop: (r) => <PriorityBadge priority={r.priority} />,
        mobileBadge: (r) => <PriorityBadge priority={r.priority} />,
      },
      {
        key: "publishDate",
        label: "Published",
        sortable: true,
        sortAccessor: (r) => r.publishDate.getTime(),
        desktop: (r) => (
          <div>
            <div className="text-text-primary text-body-sm">
              {r.publishDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })}
            </div>
            <div className="text-text-muted text-xs">
              {formatRelativeTime(r.publishDate)}
            </div>
          </div>
        ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "status",
        label: "Status",
        desktop: (r) =>
          r.isActive ? (
            <Badge variant="success" size="sm" icon={<Eye />}>
              Active
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm" icon={<EyeOff />}>
              Inactive
            </Badge>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <Tabs
        items={tabs}
        value={filter}
        onChange={(v) => setFilter(v as StatusFilter)}
        variant="underline"
        size="md"
      />

      <ProTable<AdminAnnouncementRow>
        data={filtered}
        columns={columns}
        rowKey="id"
        search
        searchPlaceholder="Search by title, category…"
        searchKeys={["title", "category", "content"]}
        density="comfortable"
        stickyHeader
        maxHeight="70vh"
        emptyTitle={
          filter === "ALL"
            ? "No announcements yet"
            : `No ${filter.toLowerCase()} announcements`
        }
        emptyDescription={
          filter === "ALL"
            ? "Create the first announcement to inform residents."
            : "Try a different filter."
        }
        actions={(row) => [
          {
            label: "Edit",
            icon: <Edit />,
            href: () => `/admin/announcements/${row.id}/edit`,
          },
          {
            label: row.isActive ? "Deactivate" : "Activate",
            icon: row.isActive ? <EyeOff /> : <Eye />,
            onClick: () => handleToggleActive(row.id),
          },
          {
            label: "Delete",
            icon: <Trash2 />,
            variant: "danger",
            onClick: () => setDeleteTarget(row),
          },
        ]}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title="Delete announcement?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. Residents will no longer see it.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete forever"}
            </Button>
          </>
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Priority Badge
// ─────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    low: { label: "Low", variant: "neutral" as const },
    medium: { label: "Medium", variant: "info" as const },
    high: { label: "High", variant: "warning" as const },
    critical: { label: "Critical", variant: "danger" as const },
  }[priority] ?? { label: priority, variant: "neutral" as const };

  return (
    <Badge size="sm" variant={config.variant}>
      {config.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function priorityRank(p: string): number {
  const ranks = { low: 1, medium: 2, high: 3, critical: 4 };
  return ranks[p as keyof typeof ranks] ?? 0;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
