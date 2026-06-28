import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const getOutstandingBillsTool = tool({
  description: "Get outstanding maintenance bills for a given villa number",
  inputSchema: z.object({
    villaNo: z.number(),
  }),

  execute: async ({ villaNo }) => {
    const villa = await prisma.villa.findUnique({
      where: { villaNo },
      select: { id: true },
    });

    if (!villa) {
      return { message: "Villa not found" };
    }

    const bills = await prisma.maintenanceBill.findMany({
      where: {
        villaId: villa.id,
        status: { in: ["PENDING", "PARTIAL"] },
      },
      orderBy: { year: "desc" },
    });

    return {
      count: bills.length,
      bills: bills.map((b) => ({
        month: b.month,
        year: b.year,
        amount: b.amount,
        status: b.status,
      })),
    };
  },
});
