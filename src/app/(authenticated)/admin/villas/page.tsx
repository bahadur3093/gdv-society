// src/app/(authenticated)/admin/villas/page.tsx

import { Home } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/auth';
import { getAdminVillas } from '@/lib/villas/getAdminVillas';
import PageHeader from '@/components/navigation/PageHeader';
import VillasListView from './_components/VillasListView';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Villas — Admin' };

export default async function VillasAdminPage() {
  await requireAdmin();
  const data = await getAdminVillas();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
        }
        title="Villas"
        description={
          data.counts.all === 0
            ? 'No villas yet — add the first one to start tracking.'
            : `${data.counts.all} villa${data.counts.all === 1 ? '' : 's'} · ${data.counts.billable} billable · ${data.counts.claimed} claimed`
        }
      />

      <VillasListView rows={data.rows} counts={data.counts} />
    </div>
  );
}