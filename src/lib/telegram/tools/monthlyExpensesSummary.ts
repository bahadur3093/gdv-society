import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";

export const monthlyExpensesSummaryTool = tool({
  description:
    "Get a breakdown of society expenses for a given month, grouped by category and sorted by highest spending. Defaults to current month if not specified. Use when the admin asks about monthly expenses, spending breakdown, or what we spent on each category.",
  inputSchema: z.object({
    month: z
      .number()
      .int()
      .min(1)
      .max(12)
      .optional()
      .describe("Month 1-12. Omit for current month."),
    year: z
      .number()
      .int()
      .min(2020)
      .max(2100)
      .optional()
      .describe("Year. Omit for current year."),
  }),
  execute: async ({ month, year }) => {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const summary = await prisma.monthlyExpense.groupBy({
      by: ["category"],
      where: { month: targetMonth, year: targetYear },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    const monthName = new Date(targetYear, targetMonth - 1).toLocaleString(
      "en-IN",
      { month: "long" },
    );

    if (summary.length === 0) {
      return `No expenses recorded for ${monthName} ${targetYear}.`;
    }

    let total = 0;
    const lines = summary.map((row) => {
      const amount = row._sum.amount ?? 0;
      total += amount;
      return `• ${row.category} — ₹${amount.toLocaleString("en-IN")}`;
    });

    return [
      `📊 <b>${monthName} ${targetYear} expenses</b>`,
      ``,
      ...lines,
      ``,
      `<b>Total:</b> ₹${total.toLocaleString("en-IN")}`,
    ].join("\n");
  },
});
