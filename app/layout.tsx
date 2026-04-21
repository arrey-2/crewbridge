import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { DemoBanner } from '@/components/DemoBanner';
import { SessionHeartbeat } from '@/components/SessionHeartbeat';
import { LanguageProvider } from '@/components/LanguageProvider';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CrewBridge',
  description: 'Bridge the language gap on your job site',
  icons: [{ rel: 'icon', url: '/favicon.svg' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#5b21b680,transparent_30%),radial-gradient(circle_at_top_left,#1d4ed880,transparent_35%),linear-gradient(to_bottom,#020617,#0b1120)]" />
          <SessionHeartbeat />
          <DemoBanner />
          <Nav />
          <main className="mx-auto min-h-[80vh] max-w-7xl px-4 py-8">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
