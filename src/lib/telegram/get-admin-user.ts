import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Looks up the admin user record in the database.
 * For now, since we only have one admin chat ID, we just grab the first APPROVED admin.
 *
 * Future: when multi-admin Telegram support is added, this should map
 * Telegram user IDs to specific User records.
 */
export async function getAdminUserForTelegram(): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      accountStatus: "APPROVED",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return admin;
}
