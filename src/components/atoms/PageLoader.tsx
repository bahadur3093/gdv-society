'use client';

import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function PageLoader({ message = 'Loading...', fullScreen = false }: PageLoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
            <p className="text-slate-300 font-medium">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
}
