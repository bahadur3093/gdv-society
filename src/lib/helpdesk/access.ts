import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Can this user view this request?
 * Admins: all. Residents: only their own.
 */
export async function canViewRequest(
  user: Pick<User, "id" | "role">,
  requestId: string,
): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  const req = await prisma.residentRequest.findUnique({
    where: { id: requestId },
    select: { userId: true },
  });

  return req?.userId === user.id;
}

/**
 * Can this user comment on this request?
 */
export async function canCommentOnRequest(
  user: Pick<User, "id" | "role">,
  requestId: string,
): Promise<boolean> {
  return canViewRequest(user, requestId);
}

/**
 * Can this user reopen this request?
 * Only the original resident can reopen a RESOLVED/REJECTED request.
 */
export async function canReopenRequest(
  user: Pick<User, "id" | "role">,
  requestId: string,
): Promise<boolean> {
  const req = await prisma.residentRequest.findUnique({
    where: { id: requestId },
    select: { userId: true, status: true },
  });

  if (!req) return false;
  if (req.userId !== user.id) return false;
  return req.status === "RESOLVED" || req.status === "REJECTED";
}
