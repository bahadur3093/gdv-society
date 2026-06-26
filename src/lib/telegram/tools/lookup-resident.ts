import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const lookupResidentTool = tool({
  description:
    "Find a resident by name (fuzzy/partial match) or by exact email. Returns their details, villa info, and outstanding balance. Use when admin asks about a specific person.",
  inputSchema: z.object({
    query: z
      .string()
      .trim()
      .min(1, "Query is required")
      .describe("Name (partial OK) or email of the resident to look up"),
  }),
  execute: async ({ query }) => {
    const users = await prisma.user.findMany({
      where: {
        role: "RESIDENT",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        plotNumber: true,
        accountStatus: true,
        createdAt: true,
        villa: {
          select: {
            villaNo: true,
            areaInSqFt: true,
            maintenanceBills: {
              where: { status: { in: ["PENDING", "PARTIAL"] } },
              select: {
                amount: true,
                allocations: { select: { amount: true } },
              },
            },
          },
        },
      },
      take: 5,
    });

    if (users.length === 0) {
      return `No residents found matching "${query}".`;
    }

    if (users.length === 1) {
      const u = users[0];
      let outstanding = 0;
      if (u.villa) {
        for (const bill of u.villa.maintenanceBills) {
          const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
          outstanding += Math.max(0, bill.amount - paid);
        }
      }

      const lines = [
        `Name: ${u.name}`,
        `Email: ${u.email}`,
        `Status: ${u.accountStatus}`,
        u.villa
          ? `Villa: ${u.villa.villaNo} (${u.villa.areaInSqFt} sqft)`
          : `Villa: not linked`,
        u.villa ? `Outstanding: ₹${outstanding.toLocaleString("en-IN")}` : null,
      ].filter(Boolean);

      return lines.join("\n");
    }

    // Multiple matches
    const lines = users.map(
      (u, i) =>
        `${i + 1}. ${u.name} — ${u.email} — Villa ${u.villa?.villaNo ?? "—"} (${u.accountStatus})`,
    );
    return `Found ${users.length} matches for "${query}":\n\n${lines.join("\n")}\n\nAsk again with a more specific name or email.`;
  },
});
