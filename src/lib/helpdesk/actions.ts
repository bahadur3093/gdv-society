"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  requireResident,
  requireAdmin,
  requireApprovedUser,
} from "@/lib/auth/auth";
import { canCommentOnRequest, canReopenRequest } from "./access";
import {
    createBulkNotifications,
  createNotification,
} from "@/lib/notifications/create";
import type { CreateRequestInput } from "./types";
import { REQUEST_TYPE_LABELS } from "./constants";
import { getAllAdminUserIds } from "../notifications/admin-ids";

/* ────────────────────────────────
   Validation schemas
   ──────────────────────────────── */

const createRequestSchema = z.object({
  requestType: z.enum([
    "PLOT_SIZE_UPDATE",
    "PAYMENT_ISSUE",
    "EXPENSE_SHEET_MONTHLY",
    "EXPENSE_SHEET_YEARLY",
    "ADD_FAMILY_MEMBER",
    "PASSWORD_RESET",
  ]),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(2000),
  newPlotSize: z.number().int().positive().optional(),
  familyMemberName: z.string().max(100).optional(),
  familyMemberRelation: z.string().max(50).optional(),
  familyMemberContact: z.string().max(20).optional(),
});

const addCommentSchema = z.object({
  requestId: z.string().cuid(),
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

/* ────────────────────────────────
   Create request (resident)
   ──────────────────────────────── */

export async function createResidentRequest(input: CreateRequestInput) {
  const user = await requireApprovedUser();

  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Type-specific validation
  if (data.requestType === "PLOT_SIZE_UPDATE" && !data.newPlotSize) {
    return { ok: false as const, error: "Plot size is required" };
  }
  if (
    data.requestType === "ADD_FAMILY_MEMBER" &&
    (!data.familyMemberName || !data.familyMemberRelation)
  ) {
    return { ok: false as const, error: "Family member details are required" };
  }

  const request = await prisma.residentRequest.create({
    data: {
      userId: user.id,
      plotNumber: user.plotNumber ?? "N/A",
      requestType: data.requestType,
      description: data.description,
      newPlotSize: data.newPlotSize,
      familyMemberName: data.familyMemberName,
      familyMemberRelation: data.familyMemberRelation,
      familyMemberContact: data.familyMemberContact,
    },
  });

  // Notify all admins
  try {
    const adminIds = await getAllAdminUserIds();
    await createBulkNotifications(adminIds, {
      category: "HELPDESK",
      title: `New request: ${REQUEST_TYPE_LABELS[data.requestType]}`,
      body: `From ${user.name} (Plot ${user.plotNumber ?? "N/A"})`,
      link: `/admin/helpdesk/${request.id}`,
    });
  } catch (e) {
    console.error("[helpdesk] admin notification failed", e);
  }

  revalidatePath("/resident/requests");
  revalidatePath("/admin/helpdesk");

  return { ok: true as const, id: request.id };
}

/* ────────────────────────────────
   Add comment
   ──────────────────────────────── */

export async function addRequestComment(input: {
  requestId: string;
  content: string;
}) {
  const user = await requireApprovedUser();

  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const allowed = await canCommentOnRequest(user, input.requestId);
  if (!allowed) {
    return { ok: false as const, error: "Not allowed" };
  }

  const isAdmin = user.role === "ADMIN";

  const request = await prisma.residentRequest.findUnique({
    where: { id: input.requestId },
    select: { userId: true, requestType: true },
  });
  if (!request) return { ok: false as const, error: "Request not found" };

  await prisma.$transaction([
    prisma.requestComment.create({
      data: {
        requestId: input.requestId,
        authorId: user.id,
        content: parsed.data.content.trim(),
        isAdminComment: isAdmin,
      },
    }),
    prisma.residentRequest.update({
      where: { id: input.requestId },
      data: {
        lastResidentReplyAt: isAdmin ? undefined : new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Notify the other party
  try {
    if (isAdmin) {
      await createNotification({
        userId: request.userId,
        category: "HELPDESK",
        title: "New reply on your request",
        body: parsed.data.content.slice(0, 100),
        link: `/resident/requests/${input.requestId}`,
      });
    } else {
      const adminIds = await getAllAdminUserIds();
      await createBulkNotifications(adminIds, {
        category: "HELPDESK",
        title: `New reply from ${user.name}`,
        body: parsed.data.content.slice(0, 100),
        link: `/admin/helpdesk/${input.requestId}`,
      });
    }
  } catch (e) {
    console.error("[helpdesk] comment notification failed", e);
  }

  revalidatePath(`/resident/requests/${input.requestId}`);
  revalidatePath(`/admin/helpdesk/${input.requestId}`);

  return { ok: true as const };
}

/* ────────────────────────────────
   Admin: update status
   ──────────────────────────────── */

export async function updateRequestStatus(input: {
  requestId: string;
  status: "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  adminNotes?: string;
}) {
  const admin = await requireAdmin();

  const request = await prisma.residentRequest.findUnique({
    where: { id: input.requestId },
    select: { userId: true, status: true, requestType: true },
  });
  if (!request) return { ok: false as const, error: "Request not found" };

  const updates: any = {
    status: input.status,
    adminNotes: input.adminNotes?.trim() || undefined,
  };

  if (input.status === "RESOLVED" || input.status === "REJECTED") {
    updates.resolvedAt = new Date();
    updates.resolvedBy = admin.id;
  }

  await prisma.residentRequest.update({
    where: { id: input.requestId },
    data: updates,
  });

  // Notify resident
  try {
    const statusText =
      input.status === "IN_PROGRESS"
        ? "is being worked on"
        : input.status === "RESOLVED"
          ? "has been resolved"
          : "was rejected";

    await createNotification({
      userId: request.userId,
      category: "HELPDESK",
      title: `Your request ${statusText}`,
      body: input.adminNotes ?? undefined,
      link: `/resident/requests/${input.requestId}`,
    });
  } catch (e) {
    console.error("[helpdesk] status notification failed", e);
  }

  revalidatePath(`/admin/helpdesk`);
  revalidatePath(`/admin/helpdesk/${input.requestId}`);
  revalidatePath(`/resident/requests/${input.requestId}`);

  return { ok: true as const };
}

/* ────────────────────────────────
   Resident: reopen request
   ──────────────────────────────── */

export async function reopenRequest(requestId: string) {
  const user = await requireResident();

  const allowed = await canReopenRequest(user, requestId);
  if (!allowed)
    return { ok: false as const, error: "Cannot reopen this request" };

  await prisma.residentRequest.update({
    where: { id: requestId },
    data: {
      status: "REOPENED",
      reopenedAt: new Date(),
      reopenCount: { increment: 1 },
    },
  });

  // Notify admins
  try {
    const adminIds = await getAllAdminUserIds();
    await createBulkNotifications(adminIds, {
      category: "HELPDESK",
      title: `Request reopened by ${user.name}`,
      body: "The resident has reopened this request.",
      link: `/admin/helpdesk/${requestId}`,
    });
  } catch (e) {
    console.error("[helpdesk] reopen notification failed", e);
  }

  revalidatePath(`/resident/requests/${requestId}`);
  revalidatePath(`/admin/helpdesk/${requestId}`);

  return { ok: true as const };
}
