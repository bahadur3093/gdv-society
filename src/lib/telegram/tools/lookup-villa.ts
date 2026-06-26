import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const lookupVillaTool = tool({
  description:
    "Get details about a specific villa by its villa number, including owner, resident, area, and outstanding bills.",
  inputSchema: z.object({
    villa_number: z
      .number()
      .int()
      .min(1, "Invalid villa number")
      .describe("The villa number to look up"),
  }),
  execute: async ({ villa_number: villaNo }) => {
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
      return `Villa ${villaNo} not found.`;
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

    return lines.join("\n");
  },
});
