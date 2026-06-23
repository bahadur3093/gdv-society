import { CreditCard } from 'lucide-react';
import { getAdminPaymentRequests } from '@/lib/billing/getAdminPaymentRequests';
import PageHeader from '@/components/navigation/PageHeader';
import { requireAdmin } from '@/lib/auth/auth';
import PaymentsQueueView from './_components/PaymentsQueueView';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Payment Requests — Admin' };

export default async function PaymentsPage() {
  await requireAdmin();

  const data = await getAdminPaymentRequests();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-success/10 text-success flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        }
        title="Payment Requests"
        description={
          data.counts.pending > 0
            ? `${data.counts.pending} pending review · ${data.counts.total} total`
            : `${data.counts.total} total requests`
        }
      />

      <PaymentsQueueView rows={data.rows} counts={data.counts} />
    </div>
  );
}