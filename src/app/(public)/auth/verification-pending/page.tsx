import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import PendingPageClient from "./_components/PendingPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account Pending — GDV Society Hub",
};

export default async function VerificationPendingPage() {
  const session = await auth();

  // Not signed in? Send them to signin
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Re-check status from DB (not stale session)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      accountStatus: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // User is APPROVED → don't show pending page, send them in
  if (user.accountStatus === "APPROVED") {
    if (user.role === "ADMIN") {
      redirect("/admin/ledger");
    }
    redirect("/resident");
  }

  // User is SUSPENDED → show different message
  if (user.accountStatus === "SUSPENDED") {
    redirect("/auth/signin?error=suspended");
  }

  // User is PENDING → show the pending page
  return <PendingPageClient userEmail={user.email} userName={user.name} />;
}
