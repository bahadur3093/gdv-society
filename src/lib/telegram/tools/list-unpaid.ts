import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const listUnpaidTool = tool({
  description:
    "List villas that have outstanding maintenance bills (unpaid or partial). Use when admin asks about unpaid bills, dues, outstanding amounts, or who owes money.",
  inputSchema: z.object({}),
  execute: async () => {
    const villas = await prisma.villa.findMany({
      where: {
        isBillable: true,
        maintenanceBills: {
          some: {
            status: { in: ["PENDING", "PARTIAL"] },
          },
        },
      },
      select: {
        villaNo: true,
        ownerName: true,
        user: { select: { name: true } },
        maintenanceBills: {
          where: { status: { in: ["PENDING", "PARTIAL"] } },
          select: {
            amount: true,
            allocations: { select: { amount: true } },
          },
        },
      },
      orderBy: { villaNo: "asc" },
    });

    if (villas.length === 0) {
      return "All villas are paid up. No outstanding bills.";
    }

    let totalOutstanding = 0;
    const lines = villas.map((v) => {
      let owed = 0;
      for (const bill of v.maintenanceBills) {
        const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
        owed += Math.max(0, bill.amount - paid);
      }
      totalOutstanding += owed;
      const name = v.user?.name ?? v.ownerName;
      return `• Villa ${v.villaNo} (${name}) — ₹${owed.toLocaleString("en-IN")} (${v.maintenanceBills.length} bill${v.maintenanceBills.length === 1 ? "" : "s"})`;
    });

    return `${villas.length} villa${villas.length === 1 ? "" : "s"} with unpaid bills, total outstanding ₹${totalOutstanding.toLocaleString("en-IN")}:\n\n${lines.join("\n")}`;
  },
});
