import { prisma } from "@/lib/prisma";

/**
 * Get all approved admin user IDs (for bulk notifications).
 */
export async function getAllAdminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", accountStatus: "APPROVED" },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}
