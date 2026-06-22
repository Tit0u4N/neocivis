import '../global.css';
import type { Metadata } from 'next';
import { Figtree, Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { AuthGate } from '@/components/auth/AuthGate';
import { ApiProvider } from '@/providers/ApiProvider';
import { AppProvider } from '@/providers/AppProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { I18nProvider } from '@/providers/I18nProvider';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeoCivis',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <AppProvider>
            <AuthProvider>
              <ApiProvider>
                <AuthGate>{children}</AuthGate>
              </ApiProvider>
            </AuthProvider>
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
