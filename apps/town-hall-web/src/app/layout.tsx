'use client';

import '../global.css';
import { Building2 } from 'lucide-react';
import { Figtree, Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { AppProvider } from '@/components/AppProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ApiProvider } from '@/providers/ApiProvider';
import { AuthProvider } from '@/providers/AuthProvider';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

function AuthGate({ children }: Readonly<{ children: ReactNode }>) {
  const auth = useAuth();
  const { t } = useTranslation();

  const handleSignIn = async () => {
    await auth.signinRedirect();
  };

  if (auth.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-xl bg-primary">
            <Building2 className="size-8 text-primary-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl text-primary uppercase tracking-wide">{t('app.shortName')}</h1>
            <p className="text-muted-foreground text-sm">{t('auth.subtitle')}</p>
          </div>
          <Button className="uppercase tracking-widest" size={'lg'} onClick={handleSignIn}>
            {t('nav.login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <AppProvider>
            <AuthProvider>
              <AuthGate>
                <ApiProvider>{children}</ApiProvider>
              </AuthGate>
            </AuthProvider>
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
