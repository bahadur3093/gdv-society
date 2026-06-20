export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 bg-slate-800 rounded" />
        <div className="h-4 w-96 bg-slate-800 rounded" />
      </div>
      <div className="h-64 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
      <div className="h-48 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
    </div>
  );
}
