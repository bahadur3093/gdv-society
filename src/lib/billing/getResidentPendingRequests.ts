import "server-only";
import { prisma } from "@/lib/prisma";

export interface PendingRequest {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  status: "PENDING" | "REJECTED";
  submittedAt: Date;
  reviewNotes: string | null;
}

/**
 * Fetch this resident's outstanding payment requests
 * (PENDING + recently REJECTED so they see why).
 */
export async function getResidentPendingRequests(
  userId: string,
): Promise<PendingRequest[]> {
  const requests = await prisma.paymentRequest.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "REJECTED"] },
    },
    select: {
      id: true,
      amount: true,
      method: true,
      reference: true,
      status: true,
      submittedAt: true,
      reviewNotes: true,
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return requests.map((r) => ({
    id: r.id,
    amount: r.amount,
    method: r.method,
    reference: r.reference,
    status: r.status as "PENDING" | "REJECTED",
    submittedAt: r.submittedAt,
    reviewNotes: r.reviewNotes,
  }));
}
