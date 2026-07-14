import { prisma } from "@/lib/prisma";
import type { RequestFilters } from "./types";

/**
 * List requests for a resident (their own only)
 */
export async function listResidentRequests(
  userId: string,
  filters: RequestFilters = {},
) {
  const where: any = { userId };

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.type && filters.type !== "ALL") {
    where.requestType = filters.type;
  }
  if (filters.search?.trim()) {
    where.description = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  return prisma.residentRequest.findMany({
    where,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { comments: true } },
    },
  });
}

/**
 * List all requests (admin queue)
 */
export async function listAllRequests(filters: RequestFilters = {}) {
  const where: any = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.type && filters.type !== "ALL") {
    where.requestType = filters.type;
  }
  if (filters.search?.trim()) {
    where.OR = [
      { description: { contains: filters.search.trim(), mode: "insensitive" } },
      { plotNumber: { contains: filters.search.trim(), mode: "insensitive" } },
      {
        user: {
          name: { contains: filters.search.trim(), mode: "insensitive" },
        },
      },
    ];
  }

  return prisma.residentRequest.findMany({
    where,
    orderBy: [
      { status: "asc" }, // PENDING/IN_PROGRESS first
      { updatedAt: "desc" },
    ],
    include: {
      user: {
        select: { id: true, name: true, email: true, plotNumber: true },
      },
      _count: { select: { comments: true } },
    },
    take: 200,
  });
}

/**
 * Get single request with full detail + comments thread
 */
export async function getRequestDetail(requestId: string) {
  return prisma.residentRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: { id: true, name: true, email: true, plotNumber: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
}

/**
 * Admin queue stats
 */
export async function getHelpdeskStats() {
  const [pending, inProgress, resolved, rejected, total] = await Promise.all([
    prisma.residentRequest.count({ where: { status: "PENDING" } }),
    prisma.residentRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.residentRequest.count({ where: { status: "RESOLVED" } }),
    prisma.residentRequest.count({ where: { status: "REJECTED" } }),
    prisma.residentRequest.count(),
  ]);

  const reopened = await prisma.residentRequest.count({
    where: { status: "REOPENED" },
  });

  return {
    pending,
    inProgress,
    resolved,
    rejected,
    reopened,
    total,
    open: pending + inProgress + reopened,
  };
}

/**
 * Count open requests for a resident (for badges/notifications)
 */
export async function countOpenResidentRequests(userId: string) {
  return prisma.residentRequest.count({
    where: {
      userId,
      status: { in: ["PENDING", "IN_PROGRESS", "REOPENED"] },
    },
  });
}
