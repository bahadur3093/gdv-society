import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const listPendingTool = tool({
  description:
    "List all resident users who are pending admin approval. Use when the admin asks about pending signups, new registrations, or who is waiting for approval.",
  inputSchema: z.object({}),
  execute: async () => {
    const users = await prisma.user.findMany({
      where: {
        role: "RESIDENT",
        accountStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        plotNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (users.length === 0) {
      return "No users are currently pending approval.";
    }

    const lines = users.map((u, i) => {
      const days = Math.floor(
        (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const ago =
        days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
      return `${i + 1}. ${u.name} (Plot ${u.plotNumber ?? "—"}) — ${u.email} — signed up ${ago}`;
    });

    return `Found ${users.length} pending user${users.length === 1 ? "" : "s"}:\n\n${lines.join("\n")}`;
  },
});