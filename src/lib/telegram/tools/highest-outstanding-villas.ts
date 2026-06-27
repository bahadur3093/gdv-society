import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";

export const highestOutstandingVillasTool = tool({
  description:
    "Retrieve the top 5 villas with the highest outstanding maintenance balances. Use when admin asks who owes the most, top defaulters, or which villas have the biggest dues.",
  inputSchema: z.object({}),
  execute: async () => {
    const villas = await prisma.villa.findMany({
      where: {
        isBillable: true,
        maintenanceBills: {
          some: { status: { in: ["PENDING", "PARTIAL"] } },
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
    });

    // Compute outstanding per villa
    const ranked = villas
      .map((v) => {
        let outstanding = 0;
        for (const bill of v.maintenanceBills) {
          const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
          outstanding += Math.max(0, bill.amount - paid);
        }
        return {
          villaNo: v.villaNo,
          name: v.user?.name ?? v.ownerName,
          outstanding,
          unpaidCount: v.maintenanceBills.length,
        };
      })
      .filter((v) => v.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);

    if (ranked.length === 0) {
      return "All villas are paid up. No outstanding balances.";
    }

    const lines = ranked.map(
      (v, i) =>
        `${i + 1}. Villa ${v.villaNo} (${v.name}) — ₹${v.outstanding.toLocaleString("en-IN")} (${v.unpaidCount} bill${v.unpaidCount === 1 ? "" : "s"})`,
    );

    const total = ranked.reduce((s, v) => s + v.outstanding, 0);

    return [
      `💰 <b>Top 5 outstanding villas</b>`,
      ``,
      ...lines,
      ``,
      `<b>Combined outstanding:</b> ₹${total.toLocaleString("en-IN")}`,
    ].join("\n");
  },
});
