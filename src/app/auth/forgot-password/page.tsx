'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, CheckCircle, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit password reset request');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setRequestStatus('pending');
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred while submitting your request');
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-slate-400">
            {!success
              ? 'Request a password reset from the administrator'
              : 'Your request has been submitted'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-6">
          {!success ? (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-cyan-400">
                    <strong>How it works:</strong>
                  </p>
                  <ul className="mt-2 text-xs text-cyan-300 space-y-1 list-disc list-inside">
                    <li>Submit your email address</li>
                    <li>Admin will receive your password reset request</li>
                    <li>Admin will review and approve/reset your password</li>
                    <li>You'll be able to set a new password on next login</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting request...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Request Password Reset
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Request Submitted Successfully</h3>
                  <p className="text-slate-400 text-sm">
                    Your password reset request has been sent to the administrator.
                  </p>
                </div>

                {/* Request Status */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                    <span className="text-sm font-medium text-yellow-400">Request Status: Pending Review</span>
                  </div>
                  <p className="text-xs text-yellow-300">
                    The administrator will review your request shortly. Once approved, you'll be able to set a new password when you sign in.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleBackToSignIn}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    You can try signing in once the admin approves your request
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Info */}
        {!success && (
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Need help?</strong> If you don't have an account yet, please{' '}
              <a href="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                sign up
              </a>{' '}
              first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}