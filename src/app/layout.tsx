import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/contexts/theme-context';

export const metadata: Metadata = {
  title: 'Nahj al-Balagha | Path of Eloquence',
  description:
    'An intelligent knowledge and personalized learning companion exploring the wisdom, eloquence, and governance of Imam Ali ibn Abi Talib (a.s.) with verified citations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF9F5] text-[#18231C] flex flex-col md:flex-row antialiased selection:bg-[#EBF3EE] selection:text-[#143E2E]">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <Topbar />
                <main className="flex-1 p-3.5 sm:p-5 md:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
                  {children}
                </main>
              </div>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
