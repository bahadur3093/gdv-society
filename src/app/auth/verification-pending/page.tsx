'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Hourglass, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function VerificationPendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the session to check if user has been verified
      const response = await fetch('/api/auth/session?update');
      if (response.ok) {
        const updatedSession = await response.json();
        
        // If user is now verified, redirect to dashboard
        if (updatedSession?.user?.emailVerified) {
          router.push('/dashboard');
        } else {
          // Force a hard refresh to update the session
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  // If user is verified, redirect to dashboard
  if (session?.user?.emailVerified) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Pulsing Aurora Cyan Glow Container */}
        <div className="relative">
          {/* Ambient background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/10 to-transparent rounded-3xl blur-3xl animate-pulse"></div>
          
          {/* Main card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/40 rounded-2xl p-8 shadow-2xl">
            {/* Icon container with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-cyan-500/20 to-violet-500/20 p-6 rounded-full border border-cyan-500/30">
                  <Hourglass className="w-12 h-12 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Verification Pending
            </h1>

            {/* Description */}
            <div className="space-y-4 text-slate-300 text-center mb-8">
              <p className="text-sm leading-relaxed">
                Your profile for Plot allocation is currently awaiting verification.
              </p>
              <p className="text-sm leading-relaxed">
                The GDV Management Committee is matching your plot entry against the master registry to assign your official Square Footage and asset ledger details.
              </p>
              <p className="text-xs text-slate-400 mt-4">
                You will receive access to the resident dashboard once your account is approved by an administrator.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Refresh Status Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-lg font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Checking Status...' : 'Refresh Status'}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-300 ease-in-out border border-slate-700/50 hover:border-slate-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* User info */}
            {session?.user && (
              <div className="mt-6 pt-6 border-t border-slate-800/40">
                <p className="text-xs text-slate-400 text-center">
                  Logged in as: <span className="text-slate-300 font-medium">{session.user.email}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}