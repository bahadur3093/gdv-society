import { prisma } from "@/lib/prisma";
import type { RegisteredTool } from "./types";

export const lookupVillaTool: RegisteredTool = {
  definition: {
    name: "lookup_villa",
    description:
      "Get details about a specific villa by its villa number, including owner, resident, area, and outstanding bills.",
    parameters: {
      type: "object",
      properties: {
        villa_number: {
          type: "number",
          description: "The villa number to look up",
        },
      },
      required: ["villa_number"],
    },
  },
  handler: async (args) => {
    try {
      const villaNo = Number(args.villa_number);
      if (!Number.isInteger(villaNo) || villaNo < 1) {
        return {
          success: false,
          data: "",
          error: "Invalid villa number",
        };
      }

      const villa = await prisma.villa.findUnique({
        where: { villaNo },
        select: {
          villaNo: true,
          type: true,
          ownerName: true,
          areaInSqFt: true,
          isBillable: true,
          user: {
            select: {
              name: true,
              email: true,
              accountStatus: true,
            },
          },
          maintenanceBills: {
            where: { status: { in: ["PENDING", "PARTIAL"] } },
            select: {
              month: true,
              year: true,
              amount: true,
              allocations: { select: { amount: true } },
            },
            orderBy: [{ year: "desc" }, { month: "desc" }],
          },
        },
      });

      if (!villa) {
        return {
          success: true,
          data: `Villa ${villaNo} not found.`,
        };
      }

      let outstanding = 0;
      for (const bill of villa.maintenanceBills) {
        const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
        outstanding += Math.max(0, bill.amount - paid);
      }

      const lines = [
        `Villa: ${villa.villaNo} (${villa.type}, ${villa.areaInSqFt} sqft)`,
        `Owner on record: ${villa.ownerName}`,
        villa.user
          ? `Resident: ${villa.user.name} — ${villa.user.email} (${villa.user.accountStatus})`
          : `Resident: not claimed`,
        `Billable: ${villa.isBillable ? "Yes" : "No"}`,
        `Outstanding bills: ${villa.maintenanceBills.length}`,
        `Total outstanding: ₹${outstanding.toLocaleString("en-IN")}`,
      ];

      return { success: true, data: lines.join("\n") };
    } catch (e) {
      return {
        success: false,
        data: "",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  },
};
