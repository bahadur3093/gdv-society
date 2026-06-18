"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Hourglass, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getLandingPath } from "@/lib/auth/redirect";

export default function VerificationPendingClient() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wasApproved, setWasApproved] = useState(false);

  // Safety net: if session changes mid-page (e.g. tab regains focus and
  // SessionProvider refetches), bounce them out.
  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.replace(getLandingPath(session));
    }
  }, [session, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await update();

      if (updated?.user?.emailVerified) {
        setWasApproved(true);
        setTimeout(() => {
          router.replace(getLandingPath(updated));
        }, 1500);
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/signin" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/10 to-transparent rounded-3xl blur-3xl animate-pulse" />

          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/40 rounded-2xl p-8 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {wasApproved ? (
                  <>
                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl" />
                    <div className="relative bg-gradient-to-br from-green-500/20 to-cyan-500/20 p-6 rounded-full border border-green-500/30">
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-cyan-500/20 to-violet-500/20 p-6 rounded-full border border-cyan-500/30">
                      <Hourglass className="w-12 h-12 text-cyan-400 animate-pulse" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {wasApproved ? "Account Approved!" : "Verification Pending"}
            </h1>

            {/* Description */}
            {wasApproved ? (
              <div className="text-center mb-8">
                <p className="text-sm text-green-400 leading-relaxed">
                  Your account has been approved. Redirecting to your dashboard…
                </p>
              </div>
            ) : (
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
            )}

            {/* Actions */}
            {!wasApproved && (
              <div className="space-y-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-lg font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Checking with server…" : "Refresh Status"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-300 ease-in-out border border-slate-700/50 hover:border-slate-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {/* User info */}
            {session?.user && (
              <div className="mt-6 pt-6 border-t border-slate-800/40">
                <p className="text-xs text-slate-400 text-center">
                  Logged in as:{" "}
                  <span className="text-slate-300 font-medium">
                    {session.user.email}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}