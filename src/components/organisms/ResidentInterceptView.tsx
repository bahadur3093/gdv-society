'use client';

import { Hourglass, RefreshCw } from 'lucide-react';

interface ResidentInterceptViewProps {
  onRefreshStatus: () => void;
}

export default function ResidentInterceptView({ onRefreshStatus }: ResidentInterceptViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Pulsing Aurora Cyan Glow with Hourglass Icon */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative bg-slate-900/50 p-8 rounded-full border border-cyan-500/30">
            <Hourglass className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-100 mb-4">
          Account Verification in Progress
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl mx-auto">
          Your profile for Plot allocation is currently awaiting verification. The GDV Management 
          Committee is matching your plot entry against the master registry to assign your official 
          Square Footage and asset ledger details.
        </p>

        {/* Additional Info */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 mb-8 max-w-xl mx-auto">
          <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
            What happens next?
          </h2>
          <ul className="text-left text-slate-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Your plot number is being validated against the master villa registry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Square footage and maintenance calculations are being assigned</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Your account ledger and financial records are being initialized</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>You'll receive full access once verification is complete</span>
            </li>
          </ul>
        </div>

        {/* Refresh Status Button */}
        <button
          onClick={onRefreshStatus}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Refresh Status
        </button>

        <p className="text-xs text-slate-500 mt-6">
          Typically, verification is completed within 24-48 hours during business days.
        </p>
      </div>
    </div>
  );
}
