import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { isChatAllowedForEmail } from "@/lib/chat/access";
import { prisma } from "@/lib/prisma";
import ChatSidebar from "./_components/ChatSidebar";

export const dynamic = "force-dynamic";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  if (!isChatAllowedForEmail(admin.email)) {
    notFound();
  }

  const conversations = await prisma.chatConversation.findMany({
    where: { userId: admin.id },
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
    ],
    take: 50,
    select: {
      id: true,
      title: true,
      isPinned: true,
      updatedAt: true,
    },
  });

  return (
    <div className="flex h-[calc(100vh-128px)] gap-4">
      <ChatSidebar
        conversations={conversations.map((c) => ({
          ...c,
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
      {children}
    </div>
  );
}
