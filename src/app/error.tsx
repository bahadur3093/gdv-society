'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="mt-2 text-gray-600">This could be a network issue or a temporary server error.</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white transition-hover hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}