import type React from 'react';
import '../global.css';
import { Figtree, Geist, Geist_Mono } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { ApiProvider } from '@/providers/ApiProvider';
import { AuthProvider } from '@/providers/AuthProvider';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <AuthProvider>
            <ApiProvider>{children}</ApiProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
