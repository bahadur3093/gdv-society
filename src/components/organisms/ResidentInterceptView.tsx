'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Hourglass, RefreshCw, CheckCircle2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Shown inside the dashboard when a resident's account has not been approved yet.
 * Clicking "Refresh Status" calls useSession().update() which triggers the jwt
 * "update" callback in auth.ts, re-fetching emailVerified from the DB.
 * If the admin has approved the account, the session is updated and the user is
 * redirected to the dashboard automatically.
 */
export default function ResidentInterceptView() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wasApproved, setWasApproved] = useState(false);

  // Redirect as soon as the session reflects approval
  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await update();
      if (updated?.user?.emailVerified) {
        setWasApproved(true);
        // Brief success display before redirect (handled by the useEffect above)
      }
    } catch (error) {
      console.error('[ResidentInterceptView] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Icon with glow */}
        <div className="relative inline-block mb-8">
          {wasApproved ? (
            <>
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
              <div className="relative bg-slate-900/50 p-8 rounded-full border border-green-500/30">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse-glow" />
              <div className="relative bg-slate-900/50 p-8 rounded-full border border-cyan-500/30">
                <Hourglass className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-100 mb-4">
          {wasApproved ? 'Account Approved!' : 'Account Verification in Progress'}
        </h1>

        {wasApproved ? (
          <p className="text-lg text-green-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Your account has been approved. Redirecting to your dashboard…
          </p>
        ) : (
          <>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              {/* Refresh Status Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isRefreshing ? 'Checking…' : 'Refresh Status'}
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/auth/signin' })}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-300 ease-in-out border border-slate-700/50 hover:border-slate-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-6">
              Typically, verification is completed within 24-48 hours during business days.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
