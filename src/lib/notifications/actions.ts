"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false };
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // ensure user can only mark their own
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  } catch (e) {
    console.error("[markNotificationRead] failed:", e);
    return { success: false };
  }
}

export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false };
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  } catch (e) {
    console.error("[markAllNotificationsRead] failed:", e);
    return { success: false };
  }
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false };
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (e) {
    console.error("[deleteNotification] failed:", e);
    return { success: false };
  }
}
