import { CreditCard } from 'lucide-react';
import { getResidentLedger } from '@/lib/billing/getResidentLedger';
import { getResidentPendingRequests } from '@/lib/billing/getResidentPendingRequests';
import PageHeader from '@/components/navigation/PageHeader';
import { requireResident } from '@/lib/auth/auth';
import Card from '@/components/atoms/Card';
import EmptyState from '@/components/organisms/EmptyState';
import PayRequestForm from './_components/PayRequestForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pay Now — GDV Resident Hub',
};

export default async function PayPage() {
  const user = await requireResident();

  const [ledger, pendingRequests] = await Promise.all([
    getResidentLedger(user.id),
    getResidentPendingRequests(user.id),
  ]);

  // No villa → show error state
  if (!ledger.villa) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          leading={
            <div className="w-12 h-12 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
          }
          back={{ href: '/resident', label: 'Back to dashboard' }}
          title="Pay Now"
          description="Submit payment details for admin verification"
        />
        <Card padding="lg">
          <EmptyState
            icon={<CreditCard />}
            title="No villa linked"
            description="Contact the society admin to link your villa to your account before submitting payments."
            tone="warning"
          />
        </Card>
      </div>
    );
  }

  // Compute pending count (only PENDING — rejections don't block new submissions)
  const pendingCount = pendingRequests.filter(
    (r) => r.status === 'PENDING'
  ).length;
  const pendingAmount = pendingRequests
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        }
        back={{ href: '/resident', label: 'Back to dashboard' }}
        title="Pay Now"
        description="Submit your payment details. The admin will verify and confirm it within 24 hours."
      />

      <PayRequestForm
        outstandingBalance={ledger.summary.outstandingBalance}
        villaNo={ledger.villa.villaNo}
        pendingRequests={pendingRequests}
        pendingCount={pendingCount}
        pendingAmount={pendingAmount}
      />
    </div>
  );
}