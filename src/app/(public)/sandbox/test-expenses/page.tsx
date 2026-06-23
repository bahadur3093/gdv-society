import { getAdminExpenses } from "@/lib/expenses/getExpenses";

export default async function TestPage() {
  const data = await getAdminExpenses();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-h1 text-text-primary">Expenses Query Test</h1>
      <div className="mt-4 p-4 bg-bg-sunken rounded">
        <p>Total rows: {data.rows.length}</p>
        <p>This month total: ₹{data.stats.thisMonthTotal}</p>
        <p>Last month total: ₹{data.stats.lastMonthTotal}</p>
        <p>Avg monthly (6m): ₹{data.stats.avgMonthly6m.toFixed(0)}</p>
        <p>
          Largest category:{" "}
          {data.stats.largestCategoryThisMonth?.category ?? "none"}
        </p>
      </div>
      <pre className="text-body-sm font-mono whitespace-pre-wrap mt-4">
        {JSON.stringify(data.stats, null, 2)}
      </pre>
    </div>
  );
}
