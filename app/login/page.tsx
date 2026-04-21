import { Suspense } from 'react';
import LoginClient from './LoginClient';

function LoginFallback() {
  return <div className="mx-auto max-w-md glass p-8">Loading login...</div>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
