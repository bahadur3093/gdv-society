import { Receipt } from 'lucide-react';

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Receipt className="w-8 h-8 text-slate-700" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-72 bg-slate-800 rounded" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-96 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
    </div>
  );
}