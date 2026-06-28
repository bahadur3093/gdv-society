import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChatThread from "../_components/ChatThread";
import { requireAdmin } from "@/lib/auth/auth";

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
          parts: true,
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
        parts: toUIParts(m.parts, m.content),
      }))}
    />
  );
}

function toUIParts(parts: unknown, fallbackText: string) {
  if (Array.isArray(parts) && parts.length > 0) {
    return parts as Array<{ type: string; [k: string]: unknown }>;
  }
  return [{ type: "text", text: fallbackText }];
}
