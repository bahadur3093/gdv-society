"use server";

import { auth, signOut } from "@/lib/auth/auth";
import { notifyAdminOfSignup } from "@/lib/email/notify-admins";
import { redirect } from "next/navigation";

export async function signOutFromPendingAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/auth/signin");
}

export async function pingAdminAction(): Promise<{
  success: boolean;
  message: string;
}> {
    console.log('session');
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: "Not signed in" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      plotNumber: true,
      accountStatus: true,
    },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (user.accountStatus !== "PENDING") {
    return { success: false, message: "Account already processed" };
  }

  await notifyAdminOfSignup({
    newUserName: user.name,
    newUserEmail: user.email,
    newUserPlotNumber: user.plotNumber,
    newUserId: user.id,
  });

  return { success: true, message: "Admin has been notified" };
}
