'use client';

import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/ui/page-layout';
import { useAccountPage } from './useAccountPage';

export function AccountPage() {
  const { t } = useTranslation();
  const { user, handleLogout } = useAccountPage();

  return (
    <PageLayout title={t('nav.account')}>
      <div className="max-w-2xl space-y-6">
        <section className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">{t('auth.welcome')}</h2>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="space-y-0.5">
              {user !== null && (
                <>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </>
              )}
            </div>
            <Button variant="destructive" size="lg" onClick={handleLogout}>
              <LogOut />
              {t('nav.logout')}
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
