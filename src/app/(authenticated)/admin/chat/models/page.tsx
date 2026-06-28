import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import ModelsView from "../../ai-models/_components/ModelsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Models — Admin Chat" };

export default async function ModelsPage() {
  const admin = await requireAdmin();
  if (!isChatAllowedForEmail(admin.email)) notFound();

  const models = await prisma.chatModel.findMany({
    orderBy: [{ status: "asc" }, { label: "asc" }],
  });

  return (
    <ModelsView
      initialModels={models.map((m) => ({
        ...m,
        lastTested: m.lastTested?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))}
    />
  );
}
