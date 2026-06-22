import { requireResident } from "@/lib/auth/auth";
import ResidentShell from "./ResidentShell";
import prisma from "@/lib/prisma";

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
    <ResidentShell userName={user.name} villaNo={villa?.villaNo ?? null}>
      {children}
    </ResidentShell>
  );
}
