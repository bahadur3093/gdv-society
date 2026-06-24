import { prisma } from "@/lib/prisma";
import type { RegisteredTool } from "./types";

export const societyStatsTool: RegisteredTool = {
  definition: {
    name: "society_stats",
    description:
      "Get high-level statistics about the society: total villas, claimed/unclaimed, total residents, pending users, total outstanding, current month expenses. Use when admin asks for overview, stats, summary, or society health.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  handler: async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [
        totalVillas,
        claimedVillas,
        totalResidents,
        pendingResidents,
        billsThisMonth,
        expensesThisMonth,
      ] = await Promise.all([
        prisma.villa.count(),
        prisma.villa.count({ where: { userId: { not: null } } }),
        prisma.user.count({
          where: { role: "RESIDENT", accountStatus: "APPROVED" },
        }),
        prisma.user.count({
          where: { role: "RESIDENT", accountStatus: "PENDING" },
        }),
        prisma.maintenanceBill.findMany({
          where: {
            status: { in: ["PENDING", "PARTIAL"] },
          },
          select: {
            amount: true,
            allocations: { select: { amount: true } },
          },
        }),
        prisma.monthlyExpense.findMany({
          where: { month: currentMonth, year: currentYear },
          select: { amount: true },
        }),
      ]);

      const totalOutstanding = billsThisMonth.reduce((sum, b) => {
        const paid = b.allocations.reduce((s, a) => s + a.amount, 0);
        return sum + Math.max(0, b.amount - paid);
      }, 0);

      const totalExpensesThisMonth = expensesThisMonth.reduce(
        (s, e) => s + e.amount,
        0,
      );

      const monthName = now.toLocaleString("en-IN", { month: "long" });

      const data = [
        `📊 Society overview`,
        ``,
        `Villas: ${totalVillas} total, ${claimedVillas} claimed, ${totalVillas - claimedVillas} unclaimed`,
        `Residents: ${totalResidents} active, ${pendingResidents} pending approval`,
        ``,
        `Outstanding bills: ₹${totalOutstanding.toLocaleString("en-IN")}`,
        `${monthName} expenses so far: ₹${totalExpensesThisMonth.toLocaleString("en-IN")}`,
      ].join("\n");

      return { success: true, data };
    } catch (e) {
      return {
        success: false,
        data: "",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  },
};
