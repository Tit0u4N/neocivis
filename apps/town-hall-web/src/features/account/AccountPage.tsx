'use client';

import { KeyRound, Loader2, LogOut, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountPage } from './useAccountPage';

type FormFieldKey = 'firstName' | 'lastName' | 'username' | 'email';

const FIELD_KEYS: FormFieldKey[] = ['firstName', 'lastName', 'username', 'email'];

export function AccountPage() {
  const { t } = useTranslation();
  const {
    form,
    isLoading,
    loadError,
    editingField,
    editingValue,
    editingError,
    isEditSubmitting,
    passwordDialogOpen,
    isPasswordSubmitting,
    passwordError,
    passwordSuccess,
    openEditField,
    setEditingValue,
    confirmEditField,
    closeEditField,
    openPasswordDialog,
    closePasswordDialog,
    confirmPasswordReset,
    handleLogout,
  } = useAccountPage();

  const editDialog = (
    <Dialog open={editingField !== null} onOpenChange={(open) => !open && closeEditField()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingField ? t(`account.profile.fields.${editingField}`) : null}</DialogTitle>
          {editingField && <DialogDescription>{t(`account.profile.fieldHints.${editingField}`)}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <Input
            value={editingValue}
            type={editingField === 'email' ? 'email' : 'text'}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void confirmEditField();
              }
            }}
            aria-invalid={editingError !== null}
            autoFocus
          />
          {editingError && <p className="text-destructive text-xs">{editingError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeEditField} disabled={isEditSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => void confirmEditField()} disabled={isEditSubmitting}>
            {isEditSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const passwordDialog = (
    <AlertDialog open={passwordDialogOpen} onOpenChange={(open) => !open && closePasswordDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('account.passwordDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('account.passwordDialog.description', { email: form.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closePasswordDialog} disabled={isPasswordSubmitting}>
            {t('account.passwordDialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => void confirmPasswordReset()} disabled={isPasswordSubmitting}>
            {isPasswordSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('account.passwordDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <PageLayout title={t('nav.account')}>
        <div className="max-w-2xl overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="divide-y">
            {FIELD_KEYS.map((k) => (
              <div key={k} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="size-7 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('nav.account')}>
      {editDialog}
      {passwordDialog}
      <div className="max-w-2xl space-y-8">
        {/* Informations du profil */}
        <section className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {t('account.profile.title')}
            </h2>
          </div>
          {loadError && (
            <div className="border-b px-4 py-3">
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {loadError}
              </div>
            </div>
          )}
          <div className="divide-y">
            {FIELD_KEYS.map((field) => (
              <div key={field} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-0.5">
                  <Label className="text-muted-foreground text-xs">{t(`account.profile.fields.${field}`)}</Label>
                  <p className="font-medium text-sm">{form[field] || '—'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEditField(field)}
                  aria-label={t('account.profile.editAria', {
                    field: t(`account.profile.fields.${field}`),
                  })}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Mot de passe */}
        <section className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {t('account.password.title')}
            </h2>
          </div>
          <div className="px-4 py-5">
            {passwordError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 text-sm dark:text-green-400">
                {passwordSuccess}
              </div>
            )}
            <p className="mb-4 text-muted-foreground text-sm">{t('account.password.description')}</p>
            <Button variant="outline" onClick={openPasswordDialog}>
              <KeyRound className="mr-2 size-4" />
              {t('account.password.button')}
            </Button>
          </div>
        </section>

        {/* Déconnexion */}
        <section className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {t('account.session.title')}
            </h2>
          </div>
          <div className="px-4 py-4">
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              {t('nav.logout')}
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
