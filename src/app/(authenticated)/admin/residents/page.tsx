import { Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/auth';
import { getAdminResidents } from '@/lib/users/getAdminResidents';
import PageHeader from '@/components/navigation/PageHeader';
import ResidentsListView from './_components/ResidentsListView';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Residents — Admin' };

export default async function ResidentsAdminPage() {
  await requireAdmin();
  const data = await getAdminResidents();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        }
        title="Residents Directory"
        description={
          data.counts.all === 0
            ? 'No residents have registered yet.'
            : `${data.counts.all} resident${data.counts.all === 1 ? '' : 's'} · ${data.counts.claimed} with linked villas`
        }
      />

      <ResidentsListView rows={data.rows} counts={data.counts} />
    </div>
  );
}