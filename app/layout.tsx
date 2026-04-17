import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { DemoBanner } from '@/components/DemoBanner';
import { SessionHeartbeat } from '@/components/SessionHeartbeat';

export const metadata: Metadata = {
  title: 'CrewBridge',
  description: 'Bridge the language gap on your job site',
  icons: [{ rel: 'icon', url: '/favicon.svg' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionHeartbeat />
        <DemoBanner />
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
