import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UserProvider, {
  type AppUser,
} from "@/components/providers/UserProvider";
import prisma from "@/lib/prisma";
import { PlotData } from "@/types";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.accountStatus === "PENDING") {
    redirect("/auth/verification-pending");
  }
  if (session.user.accountStatus === "SUSPENDED") {
    redirect("/auth/signin?error=suspended");
  }

  const plotNumberInt =
    session.user.role === "RESIDENT" && session.user.plotNumber
      ? Number(session.user.plotNumber)
      : null;

  const plot =
    plotNumberInt !== null && Number.isInteger(plotNumberInt)
      ? await prisma.villa.findUnique({ where: { villaNo: plotNumberInt } })
      : null;

  const user: AppUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    plotNumber: session.user.plotNumber,
    emailVerified: session.user.emailVerified || null,
    plotData: plot as unknown as PlotData,
  };

  return <UserProvider user={user}>{children}</UserProvider>;
}
