import { requireResident } from '@/lib/auth/auth';
import { getResidentLedger } from '@/lib/billing/getResidentLedger';
import AccountsLedger from './_components/AccountsLedger';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Ledger — GDV Resident Hub',
};

export default async function LedgerPage() {
  const user = await requireResident();
  const data = await getResidentLedger(user.id);

  return <AccountsLedger data={data} />;
}