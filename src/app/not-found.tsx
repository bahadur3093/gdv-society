import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h2 className="text-6xl font-extrabold">404</h2>
      <p className="mt-4 text-xl">We couldn`&apos;`t find the page you`&apos;`re looking for.</p>
      <Link href="/" className="mt-6 font-medium text-blue-600 hover:underline">
        Return Home
      </Link>
    </div>
  );
}