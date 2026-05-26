'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return 'There was an error during the sign in process.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account.';
      case 'EmailSignin':
        return 'The email could not be sent.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">GDV Resident Hub</h1>
          <p className="text-slate-400">Authentication Error</p>
        </div>

        {/* Error Display */}
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Authentication Failed</h2>
              <p className="text-sm text-slate-400">{getErrorMessage(error)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/auth/signin"
              className="block w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all text-center"
            >
              Try Again
            </a>
            <a
              href="/"
              className="block w-full py-2.5 bg-slate-800/50 hover:bg-slate-800 text-white font-medium rounded-lg transition-all text-center border border-slate-700"
            >
              Go Home
            </a>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Need help?{' '}
            <a href="mailto:admin@admin.com" className="text-violet-400 hover:text-violet-300 transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
