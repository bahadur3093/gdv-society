import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getPendingPaymentRequestsCount } from "@/lib/billing/getAdminPaymentRequests";
import AdminShell from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const [pendingRequestsCount, pendingPaymentsCount] = await Promise.all([
    prisma.residentRequest.count({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    getPendingPaymentRequestsCount(),
  ]);

  return (
    <AdminShell
      userName={user.name}
      userEmail={user.email}
      badges={{
        pendingRequests: pendingRequestsCount,
        pendingPayments: pendingPaymentsCount,
      }}
    >
      {children}
    </AdminShell>
  );
}
