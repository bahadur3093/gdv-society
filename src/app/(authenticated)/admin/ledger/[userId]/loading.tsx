import { Receipt } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-5 w-40 bg-slate-800 rounded" />
      <div className="flex items-center gap-3">
        <Receipt className="w-8 h-8 text-slate-700" />
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-800 rounded" />
          <div className="h-4 w-64 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
    </div>
  );
}