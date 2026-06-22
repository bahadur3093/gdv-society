import { requireAdmin } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  // Fetch live badge counts in parallel
  const [pendingRequestsCount] = await Promise.all([
    prisma.residentRequest.count({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
    }),
    // pendingPaymentsCount: future when PaymentRequest model exists
  ]);

  return (
    <AdminShell
      userName={user.name}
      userEmail={user.email}
      badges={{
        pendingRequests: pendingRequestsCount,
      }}
    >
      {children}
    </AdminShell>
  );
}