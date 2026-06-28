import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import ChatThread from "../_components/ChatThread";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const admin = await requireAdmin();

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId: admin.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) notFound();

  return (
    <ChatThread
      conversationId={conversation.id}
      initialMessages={conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        text: m.content,
      }))}
    />
  );
}
