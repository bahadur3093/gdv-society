import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationCategory =
  | "SYSTEM"
  | "BILLING"
  | "PAYMENT"
  | "HELPDESK"
  | "WATER"
  | "ANNOUNCEMENT";

interface CreateNotificationOptions {
  userId: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Create an in-app notification for a user.
 * Fire-and-forget: errors logged but don't throw.
 */
export async function createNotification(
  options: CreateNotificationOptions,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: options.userId,
        category: options.category,
        title: options.title,
        body: options.body,
        link: options.link,
      },
    });
  } catch (e) {
    console.error("[createNotification] failed:", e);
  }
}

/**
 * Create the same notification for multiple users (bulk).
 * Used for announcements or society-wide events.
 */
export async function createBulkNotifications(
  userIds: string[],
  options: Omit<CreateNotificationOptions, "userId">,
): Promise<void> {
  if (userIds.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        category: options.category,
        title: options.title,
        body: options.body,
        link: options.link,
      })),
    });
  } catch (e) {
    console.error("[createBulkNotifications] failed:", e);
  }
}

/**
 * Find all APPROVED RESIDENT user IDs (helpful for bulk).
 */
export async function getAllApprovedResidentIds(): Promise<string[]> {
  const residents = await prisma.user.findMany({
    where: {
      role: "RESIDENT",
      accountStatus: "APPROVED",
    },
    select: { id: true },
  });
  return residents.map((r) => r.id);
}

export async function getAllAdminIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", accountStatus: "APPROVED" },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}
