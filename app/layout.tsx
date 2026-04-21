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
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-[-12rem] top-20 h-[26rem] w-[26rem] rounded-full bg-violet-500/20 blur-[130px]" />
            <div className="absolute right-[-10rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-blue-500/25 blur-[120px]" />
            <div className="absolute bottom-[-8rem] left-1/2 h-[20rem] w-[36rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[120px]" />
          </div>
          <SessionHeartbeat />
          <DemoBanner />
          <Nav />
          <main className="mx-auto min-h-[80vh] w-full max-w-[1240px] px-4 py-8 md:px-6">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
