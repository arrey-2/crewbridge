import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-panel p-6">Loading login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
