import { prisma } from "@/lib/prisma";
import type { RegisteredTool } from "./types";

export const lookupResidentTool: RegisteredTool = {
  definition: {
    name: "lookup_resident",
    description:
      "Find a resident by name (fuzzy/partial match) or by exact email. Returns their details, villa info, and outstanding balance. Use when admin asks about a specific person.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Name (partial OK) or email of the resident to look up",
        },
      },
      required: ["query"],
    },
  },
  handler: async (args) => {
    try {
      const query = String(args.query ?? "").trim();
      if (!query) {
        return {
          success: false,
          data: "",
          error: "Query is required",
        };
      }

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
        return {
          success: true,
          data: `No residents found matching "${query}".`,
        };
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
          u.villa
            ? `Outstanding: ₹${outstanding.toLocaleString("en-IN")}`
            : null,
        ].filter(Boolean);

        return { success: true, data: lines.join("\n") };
      }

      // Multiple matches
      const lines = users.map(
        (u, i) =>
          `${i + 1}. ${u.name} — ${u.email} — Villa ${u.villa?.villaNo ?? "—"} (${u.accountStatus})`,
      );
      return {
        success: true,
        data: `Found ${users.length} matches for "${query}":\n\n${lines.join("\n")}\n\nAsk again with a more specific name or email.`,
      };
    } catch (e) {
      return {
        success: false,
        data: "",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  },
};
