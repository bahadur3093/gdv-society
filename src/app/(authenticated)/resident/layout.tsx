import { requireResident } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import ResidentShell from "./_components/ResidentShell";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireResident();
  const villa = await prisma.villa.findUnique({
    where: { userId: user.id },
    select: { villaNo: true },
  });

  return (
    <ResidentShell userName={user.name} userEmail={user.email} villaNo={villa?.villaNo ?? null}>
      {children}
    </ResidentShell>
  );
}
