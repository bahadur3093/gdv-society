import { getAdminResidents } from '@/lib/users/getAdminResidents';

export default async function TestPage() {
  const data = await getAdminResidents();
  return (
    <div className="p-8">
      <h1 className="text-h1">Residents Query Test</h1>
      <pre className="text-body-sm font-mono whitespace-pre-wrap mt-4">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}