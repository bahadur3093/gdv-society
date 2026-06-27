import prisma from "@/lib/prisma";
import { tool } from "ai";
import z from "zod";

export const listAllVillas = tool({
  description:
    "Retrieve a complete listing of all villas in the society, including their numbers, owners, and status. Use this when the user asks to see, show, or list all villas (e.g., 'show me all villas', 'list villas', 'what villas do we have').",
  inputSchema: z.object({}),
  execute: async () => {
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        villaNo: true,
        areaInSqFt: true,
        type: true,
        ownerName: true,
        remarks: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!villas?.length) return "No villas found in the society";

    const lines = villas.map(
      (v, i) =>
        `${i + 1}. Villa ${v.villaNo} — ${v.type} — ${v.areaInSqFt} sq.ft — Owner: ${v.ownerName ?? "—"}`,
    );

    return `Found ${villas.length} villa${villas.length === 1 ? "" : "s"}:\n\n${lines.join("\n")}`;
  },
});
