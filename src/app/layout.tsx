import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export const metadata: Metadata = {
  title: 'Nahj al-Balagha | Personalized AI Knowledge Platform',
  description:
    'An intelligent, personalized knowledge and learning companion exploring the wisdom, eloquence, and governance of Imam Ali ibn Abi Talib (a.s.) with verified citations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-islamic-pattern text-slate-100 flex flex-col md:flex-row antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
