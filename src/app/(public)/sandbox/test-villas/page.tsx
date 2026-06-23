import { getAdminVillas } from '@/lib/villas/getAdminVillas';

export default async function TestPage() {
  const data = await getAdminVillas();
  return (
    <div className="p-8">
      <h1 className="text-h1 text-text-primary">Villas Query Test</h1>
      <div className="mt-4 p-4 bg-bg-sunken rounded text-body-sm">
        <p>Total: {data.counts.all}</p>
        <p>Billable: {data.counts.billable}</p>
        <p>Not billable: {data.counts.notBillable}</p>
        <p>Claimed: {data.counts.claimed}</p>
        <p>Unclaimed: {data.counts.unclaimed}</p>
      </div>
      <pre className="text-body-sm font-mono whitespace-pre-wrap mt-4">
        {JSON.stringify(data.rows[0], null, 2)}
      </pre>
    </div>
  );
}