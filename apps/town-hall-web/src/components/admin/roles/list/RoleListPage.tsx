'use client';

import type { PermissionKey } from '@repo/contracts';
import { MoreHorizontal, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { PERMISSION_GROUPS } from './permission-groups';
import type { useRoleListPage } from './useRoleListPage';

type Props = ReturnType<typeof useRoleListPage>;

type PickerProps = Readonly<{
  catalog: PermissionKey[];
  selected: PermissionKey[];
  onToggle: (key: PermissionKey) => void;
}>;

function PermissionPicker({ catalog, selected, onToggle }: PickerProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5 rounded-md border p-4">
      {PERMISSION_GROUPS.map(({ scope, permissions }) => {
        const visible = permissions.filter((k) => catalog.includes(k));
        if (visible.length === 0) {
          return null;
        }
        return (
          <section key={scope} className="space-y-2">
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t(`roles.permissions.groups.${scope}`)}
            </h3>
            <div className="space-y-1">
              {visible.map((key) => (
                <label key={key} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={selected.includes(key)}
                    onChange={() => onToggle(key)}
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-sm">{t(`roles.permissions.${key}`)}</p>
                    <p className="text-muted-foreground text-xs">{t(`roles.permissions.descriptions.${key}`)}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

type RoleFormDrawerProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  form: { name: string; description: string; permissions: PermissionKey[] };
  errors: { name?: string; description?: string };
  setField: (key: 'name' | 'description', value: string) => void;
  togglePermission: (key: PermissionKey) => void;
  permissionCatalog: PermissionKey[];
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}>;

function RoleFormDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  form,
  errors,
  setField,
  togglePermission,
  permissionCatalog,
  onSubmit,
  isSubmitting,
  submitLabel,
}: RoleFormDrawerProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-semibold text-base">{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label className="font-medium text-sm">{t('roles.form.nameLabel')} *</Label>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder={t('roles.form.namePlaceholder')}
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="font-medium text-sm">{t('roles.form.descriptionLabel')}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder={t('roles.form.descriptionPlaceholder')}
              rows={2}
            />
            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="font-medium text-sm">{t('roles.form.permissionsLabel')}</Label>
            <PermissionPicker catalog={permissionCatalog} selected={form.permissions} onToggle={togglePermission} />
          </div>
        </div>

        <div className="flex flex-row justify-end gap-2 border-t bg-muted/20 px-6 py-4">
          <SheetClose render={<Button variant="outline" />}>{t('common.cancel')}</SheetClose>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function RoleListPage(props: Props) {
  const { t } = useTranslation();
  const {
    roles,
    permissionCatalog,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    showCreateDialog,
    createForm,
    createErrors,
    isSubmittingCreate,
    openCreateDialog,
    closeCreateDialog,
    setCreateField,
    toggleCreatePermission,
    handleCreate,
    editingRole,
    editForm,
    editErrors,
    isSubmittingEdit,
    openEditDialog,
    closeEditDialog,
    setEditField,
    toggleEditPermission,
    handleFinishEdit,
  } = props;

  return (
    <PageLayout title={t('roles.list.title')}>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {roles.length} {t('roles.list.count')}
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          {t('roles.list.create')}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder={t('roles.list.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('roles.list.columnName')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {t('roles.list.columnDescription')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {t('roles.list.columnPermissions')}
              </th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && roles.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={4}>
                  <p className="font-medium">{t('roles.list.empty')}</p>
                </td>
              </tr>
            )}

            {!isLoading &&
              roles.map((role) => (
                <tr key={role.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{role.name}</td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <p className="truncate">{role.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{role.permissions.length} permission(s)</Badge>
                  </td>
                  <td className="w-px px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(p) => (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" {...p}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">{t('common.actions')}</span>
                          </Button>
                        )}
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(role)}>
                          {t('roles.list.actionEdit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setConfirmDeleteId(role.id)} className="text-destructive">
                          {t('roles.list.actionDelete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Create drawer */}
      <RoleFormDrawer
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateDialog();
          }
        }}
        title={t('roles.form.createTitle')}
        subtitle={t('roles.form.createSubtitle')}
        form={createForm}
        errors={createErrors}
        setField={setCreateField}
        togglePermission={toggleCreatePermission}
        permissionCatalog={permissionCatalog}
        onSubmit={handleCreate}
        isSubmitting={isSubmittingCreate}
        submitLabel={t('roles.form.createAction')}
      />

      {/* Edit drawer */}
      <RoleFormDrawer
        open={editingRole !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
        title={t('roles.form.editTitle')}
        subtitle={editingRole?.name}
        form={editForm}
        errors={editErrors}
        setField={setEditField}
        togglePermission={toggleEditPermission}
        permissionCatalog={permissionCatalog}
        onSubmit={handleFinishEdit}
        isSubmitting={isSubmittingEdit}
        submitLabel={t('roles.form.editAction')}
      />

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <AlertDialogHeader className="px-8 pt-8 pb-6">
            <AlertDialogTitle className="text-xl">{t('roles.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-base">{t('roles.delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t bg-muted/20 px-8 py-5">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('roles.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
