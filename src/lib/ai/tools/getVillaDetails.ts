import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Tone, ToolResult } from "@/components/tool-ui/ui-dsl/schema";
import { inr, ui } from "@/components/tool-ui/ui-dsl/builders";

export const getVillaDetailsTool = tool({
  description:
    "Get detailed information about a specific villa — owner, area, type, billing status, resident account, and outstanding summary. Use whenever the admin asks about villa info, owner, area, plot, occupancy, or general villa status.",
  inputSchema: z.object({
    villaNo: z.number().describe("The villa number, e.g. 12, 23, 39"),
  }),

  execute: async ({ villaNo }): Promise<ToolResult> => {
    const villa = await prisma.villa.findUnique({
      where: { villaNo },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            accountStatus: true,
          },
        },
        maintenanceBills: {
          where: { status: { in: ["PENDING", "PARTIAL"] } },
          select: { amount: true },
        },
      },
    });

    // ── Not found ──
    if (!villa) {
      return {
        data: { villaNo, found: false },
        summary: `Villa ${villaNo} was not found.`,
        ui: ui.card(`Villa ${villaNo}`, "AlertTriangle", [
          ui.empty(
            `Villa ${villaNo} doesn't exist in records.`,
            "AlertTriangle",
          ),
        ]),
      };
    }

    // ── Compute summary stats ──
    const outstandingTotal = villa.maintenanceBills.reduce(
      (s, b) => s + b.amount,
      0,
    );
    const pendingCount = villa.maintenanceBills.length;

    const occupancy = villa.user
      ? villa.user.accountStatus === "APPROVED"
        ? { label: "Occupied", tone: "success" as const }
        : { label: "Pending Approval", tone: "warning" as const }
      : { label: "Vacant", tone: "default" as const };

    // ── Compose UI ──
    return {
      data: {
        villaNo: villa.villaNo,
        type: villa.type,
        areaInSqFt: villa.areaInSqFt,
        areaInSqM: villa.areaInSqM,
        ownerName: villa.ownerName,
        remarks: villa.remarks,
        isBillable: villa.isBillable,
        user: villa.user,
        outstandingTotal,
        pendingCount,
      },
      summary:
        `Villa ${villa.villaNo} • ${villa.ownerName} • ${occupancy.label}` +
        (pendingCount > 0 ? ` • ${inr(outstandingTotal)} due` : ""),
      ui: ui.card(`Villa ${villa.villaNo}`, "Home", [
        ui.statGrid(
          [
            ui.stat("Type", villa.type, "default"),
            ui.stat("Area", `${villa.areaInSqFt} sqft`, "default"),
            ui.stat("Status", occupancy.label, occupancy.tone),
            ui.stat(
              "Outstanding",
              pendingCount > 0 ? inr(outstandingTotal) : "Clear",
              pendingCount > 0 ? "danger" : "success",
            ),
          ],
          2,
        ),

        ui.kv([
          { label: "Owner", value: villa.ownerName },
          {
            label: "Billable",
            value: villa.isBillable ? "Yes" : "No",
            badge: villa.isBillable
              ? { text: "ACTIVE", tone: "success" }
              : { text: "EXEMPT", tone: "default" },
          },
          ...(villa.remarks
            ? [{ label: "Remarks", value: villa.remarks }]
            : []),
        ]),

        ...(villa.user
          ? [
              ui.divider(),
              ui.kv([
                { label: "Resident", value: villa.user.name },
                { label: "Email", value: villa.user.email },
                {
                  label: "Account",
                  value: villa.user.accountStatus,
                  badge:
                    villa.user.accountStatus === "APPROVED"
                      ? { text: "ACTIVE", tone: "success" }
                      : villa.user.accountStatus === "PENDING"
                        ? { text: "PENDING", tone: "warning" }
                        : { text: "SUSPENDED", tone: "danger" },
                },
              ]),
            ]
          : [
              ui.divider(),
              ui.alert(
                "info" as Tone,
                "No resident account linked to this villa yet.",
                "Vacant",
              ),
            ]),
      ]),
    };
  },
});
