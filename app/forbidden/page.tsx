import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-slate-700 bg-panel p-8 text-center">
      <h1 className="text-2xl font-semibold">Access restricted</h1>
      <p className="mt-2 text-slate-300">Please sign in with a valid account.</p>
      <Link href="/login" className="mt-4 inline-block rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Go to Login</Link>
    </div>
  );
}
