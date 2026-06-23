// src/app/(authenticated)/admin/expenses/page.tsx

import { TrendingDown } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/auth';
import { getAdminExpenses } from '@/lib/expenses/getExpenses';
import PageHeader from '@/components/navigation/PageHeader';
import ExpensesView from './_components/ExpensesView';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Expenses — Admin' };

export default async function ExpensesAdminPage() {
  await requireAdmin();
  const data = await getAdminExpenses();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        }
        title="Society Expenses"
        description={
          data.rows.length === 0
            ? 'No expenses recorded yet. Add the first one to start tracking.'
            : `${data.rows.length} entries · ${formatCurrency(
                data.stats.thisMonthTotal
              )} this month`
        }
      />

      <ExpensesView rows={data.rows} stats={data.stats} />
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}