"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface AnnouncementActionState {
  status: "idle" | "success" | "error";
  message?: string;
  /** ID of the created/updated announcement (for redirects) */
  id?: string;
  /** Field-level errors */
  errors?: {
    title?: string;
    content?: string;
    category?: string;
    priority?: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  Valid categories + priorities (must match UI options)
// ─────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  "Maintenance",
  "Events",
  "Emergency",
  "General",
  "Financial",
] as const;

const VALID_PRIORITIES = ["low", "medium", "high", "critical"] as const;

// ─────────────────────────────────────────────────────────────
//  Validation helper
// ─────────────────────────────────────────────────────────────

function validateInput(formData: FormData): {
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: Date;
  isActive: boolean;
  errors?: AnnouncementActionState["errors"];
} {
  const errors: NonNullable<AnnouncementActionState["errors"]> = {};

  const title = (formData.get("title") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim() ?? "";
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const publishDateRaw = formData.get("publishDate") as string;
  const isActive = formData.get("isActive") === "true";

  if (!title) errors.title = "Title is required";
  else if (title.length > 200)
    errors.title = "Title must be 200 characters or less";

  if (!content || content === "<p></p>") errors.content = "Content is required";
  else if (content.length > 10000) errors.content = "Content is too long";

  if (
    !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
  ) {
    errors.category = "Invalid category";
  }

  if (
    !VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
  ) {
    errors.priority = "Invalid priority";
  }

  const publishDate = publishDateRaw ? new Date(publishDateRaw) : new Date();
  if (isNaN(publishDate.getTime())) {
    errors.title = errors.title ?? "Invalid publish date";
  }

  return {
    title,
    content,
    category,
    priority,
    publishDate,
    isActive,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────
//  Create
// ─────────────────────────────────────────────────────────────

export async function createAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  try {
    await requireAdmin();

    const data = validateInput(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    const created = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        publishDate: data.publishDate,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/resident");
    revalidatePath("/resident/announcements");

    return {
      status: "success",
      message: "Announcement created",
      id: created.id,
    };
  } catch (e) {
    console.error("[createAnnouncementAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to create announcement",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Update
// ─────────────────────────────────────────────────────────────

export async function updateAnnouncementAction(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) {
      return { status: "error", message: "Missing announcement ID" };
    }

    const data = validateInput(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return { status: "error", message: "Announcement not found" };
    }

    await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        publishDate: data.publishDate,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/announcements");
    revalidatePath(`/admin/announcements/${id}/edit`);
    revalidatePath("/resident");
    revalidatePath("/resident/announcements");
    revalidatePath(`/resident/announcements/${id}`);

    return {
      status: "success",
      message: "Announcement updated",
      id,
    };
  } catch (e) {
    console.error("[updateAnnouncementAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update announcement",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Toggle active state (one-click from list)
// ─────────────────────────────────────────────────────────────

export async function toggleAnnouncementActiveAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!existing) {
      return { status: "error", message: "Announcement not found" };
    }

    await prisma.announcement.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/resident");
    revalidatePath("/resident/announcements");

    return {
      status: "success",
      message: existing.isActive
        ? "Announcement deactivated"
        : "Announcement activated",
    };
  } catch (e) {
    console.error("[toggleAnnouncementActiveAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to toggle status",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Delete
// ─────────────────────────────────────────────────────────────

export async function deleteAnnouncementAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return { status: "error", message: "Announcement not found" };
    }

    // Files cascade-delete via Prisma relation (onDelete: Cascade)
    await prisma.announcement.delete({ where: { id } });

    revalidatePath("/admin/announcements");
    revalidatePath("/resident");
    revalidatePath("/resident/announcements");

    return {
      status: "success",
      message: "Announcement deleted",
    };
  } catch (e) {
    console.error("[deleteAnnouncementAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to delete",
    };
  }
}
