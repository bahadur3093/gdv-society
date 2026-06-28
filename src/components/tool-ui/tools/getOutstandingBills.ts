import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Tone, ToolResult } from "../ui-dsl/schema";
import { inr, monthName, ui } from "../ui-dsl/builders";

export const getOutstandingBillsTool = tool({
  description: "Get outstanding maintenance bills for a given villa number",
  inputSchema: z.object({
    villaNo: z.number(),
  }),

  execute: async ({ villaNo }): Promise<ToolResult> => {
    const villa = await prisma.villa.findUnique({
      where: { villaNo },
      select: { id: true },
    });

    if (!villa) {
      return {
        data: { villaNo, found: false },
        summary: `Villa ${villaNo} not found.`,
        ui: ui.card(`Villa ${villaNo}`, "AlertTriangle", [
          ui.empty(`Villa ${villaNo} was not found in records.`, "AlertTriangle"),
        ]),
      };
    }

    const bills = await prisma.maintenanceBill.findMany({
      where: { villaId: villa.id, status: { in: ["PENDING", "PARTIAL"] } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    if (bills.length === 0) {
      return {
        data: { villaNo, count: 0, bills: [] },
        summary: `Villa ${villaNo} has no outstanding bills.`,
        ui: ui.card("Outstanding Bills", "CheckCircle2", [
          ui.empty(`Villa ${villaNo} is fully paid up 🎉`, "CheckCircle2"),
        ]),
      };
    }

    const total = bills.reduce((s, b) => s + b.amount, 0);

    return {
      data: {
        villaNo,
        count: bills.length,
        total,
        bills: bills.map((b) => ({
          month: b.month, year: b.year, amount: b.amount, status: b.status,
        })),
      },
      summary: `Villa ${villaNo} has ${bills.length} pending bills totaling ${inr(total)}.`,
      ui: ui.card("Outstanding Bills", "Receipt", [
        ui.statGrid([
          ui.stat("Bills", String(bills.length), "warning"),
          ui.stat("Total Due", inr(total), "danger"),
        ]),
        ui.list(
          bills.map((b) =>
            ui.row(monthName(b.month, b.year), inr(b.amount), {
              text: b.status,
              tone: b.status === "PARTIAL" ? 'dander' as Tone : 'info' as Tone,
            }),
          ),
        ),
      ]),
    };
  },
});
``