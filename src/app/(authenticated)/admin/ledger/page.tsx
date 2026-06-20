import { getMasterLedger } from '@/lib/billing/getMasterLedger';
import MasterSummary from './_components/MasterSummary';
import ResidentsTable from './_components/ResidentsTable';
import { requireAdmin } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Master Ledger — Admin',
};

export default async function AdminMasterLedgerPage() {
  const admin = await requireAdmin();
  const data = await getMasterLedger();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Master Ledger</h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome, {admin.name} • Rate: ₹{data.ratePerSqFt}/sqft •{' '}
          {data.summary.totalVillas} villas • {data.summary.claimedVillas} claimed
        </p>
      </header>

      <MasterSummary summary={data.summary} />
      <ResidentsTable rows={data.rows} />
    </div>
  );
}