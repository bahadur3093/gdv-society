export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="h-4 w-80 bg-slate-800 rounded" />
      </div>
      <div className="h-125 bg-slate-900/30 border border-slate-800/40 rounded-lg" />
    </div>
  );
}