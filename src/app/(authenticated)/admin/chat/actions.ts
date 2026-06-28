"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function revalidateChatLayout() {
  revalidatePath("/admin/chat", "layout");
}

export async function deleteConversation(id: string) {
  await prisma.chatConversation.delete({
    where: { id },
  });

  revalidatePath("/admin/chat");
}

export async function updateConversationTitle(id: string, title: string) {
  await prisma.chatConversation.update({
    where: { id },
    data: { title },
  });

  revalidatePath("/admin/chat");
}

export async function toggleConversationPin(id: string) {
  const convo = await prisma.chatConversation.findUnique({
    where: { id },
    select: { isPinned: true },
  });

  await prisma.chatConversation.update({
    where: { id },
    data: { isPinned: !convo?.isPinned },
  });

  revalidatePath("/admin/chat");
}
