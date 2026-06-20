export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-800 rounded" />
        <div className="h-4 w-64 bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-900/30 border border-slate-800/40 rounded-xl" />
        ))}
      </div>
      <div className="h-125 bg-slate-900/30 border border-slate-800/40 rounded-xl" />
    </div>
  );
}