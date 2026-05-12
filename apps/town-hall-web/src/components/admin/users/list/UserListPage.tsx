'use client';

import type { BaseUserRole } from '@repo/contracts/user';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminUserDto, useUserListPage } from './useUserListPage';

type Props = ReturnType<typeof useUserListPage>;

const ROLE_LABELS: Record<BaseUserRole, string> = {
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  ADMIN: 'Administrateur',
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  EMPLOYEE: 'Employé',
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  CITIZEN: 'Citoyen',
};

const ROLE_VARIANTS: Record<BaseUserRole, 'default' | 'secondary' | 'outline'> = {
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  ADMIN: 'default',
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  EMPLOYEE: 'secondary',
  // biome-ignore lint/style/useNamingConvention: matches BaseUserRole enum
  CITIZEN: 'outline',
};

function getInitials(user: AdminUserDto) {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

function formatLastConnection(date: string | null): string {
  if (!date) {
    return 'Jamais';
  }
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

function UserRow({
  user,
  onEdit,
  onDeleteRequest,
}: Readonly<{
  user: AdminUserDto;
  onEdit: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">{user.email}</td>
      <td className="px-4 py-3">
        <Badge variant={ROLE_VARIANTS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">{formatLastConnection(user.lastConnection)}</td>
      <td className="w-px px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" {...props}>
                <MoreHorizontal className="size-4" />
                <span className="sr-only">{t('common.actions')}</span>
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function UserListPage(props: Props) {
  const { t } = useTranslation();
  const {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    editingUser,
    editRole,
    setEditRole,
    openEditDialog,
    closeEditDialog,
    handleFinishEdit,
    showCreateDialog,
    createForm,
    createErrors,
    openCreateDialog,
    closeCreateDialog,
    setCreateField,
    handleCreate,
  } = props;

  return (
    <PageLayout title="Gestion des utilisateurs">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{users.length} utilisateur(s)</p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Créer un utilisateur
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
            <SelectItem value="EMPLOYEE">Employé</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Rechercher un utilisateur..."
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rôle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dernière connexion</th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                  <p className="font-medium">Aucun utilisateur trouvé.</p>
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={() => openEditDialog(user)}
                  onDeleteRequest={() => setConfirmDeleteId(user.id)}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={(open) => !open && closeCreateDialog()}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <div className="flex items-center gap-4 border-b bg-muted/30 px-6 py-5">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/15 font-bold text-primary text-sm">
                {createForm.firstName[0] ?? ''}
                {createForm.lastName[0] ?? ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <AlertDialogTitle className="font-semibold text-base">
                {createForm.firstName || createForm.lastName
                  ? `${createForm.firstName} ${createForm.lastName}`.trim()
                  : 'Nouvel utilisateur'}
              </AlertDialogTitle>
              <p className="mt-0.5 text-muted-foreground text-sm">{createForm.username || 'nom.utilisateur'}</p>
            </div>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-medium text-sm">Prénom *</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) => setCreateField('firstName', e.target.value)}
                  placeholder="Jean"
                />
                {createErrors.firstName && <p className="text-destructive text-xs">{createErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-medium text-sm">Nom *</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) => setCreateField('lastName', e.target.value)}
                  placeholder="Dupont"
                />
                {createErrors.lastName && <p className="text-destructive text-xs">{createErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">{"Nom d'utilisateur *"}</Label>
              <Input
                value={createForm.username}
                onChange={(e) => setCreateField('username', e.target.value)}
                placeholder="jean.dupont"
              />
              {createErrors.username && <p className="text-destructive text-xs">{createErrors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateField('email', e.target.value)}
                placeholder="jean.dupont@mairie.fr"
              />
              {createErrors.email && <p className="text-destructive text-xs">{createErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-sm">Rôle</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateField('role', v as BaseUserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AlertDialogFooter className="border-t bg-muted/20 px-6 py-4">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate}>Créer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <AlertDialog open={editingUser !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <div className="flex items-center gap-4 border-b bg-muted/30 px-6 py-5">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/15 font-bold text-primary text-sm">
                {editingUser ? getInitials(editingUser) : ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <AlertDialogTitle className="font-semibold text-base">
                {editingUser ? `${editingUser.firstName} ${editingUser.lastName}` : ''}
              </AlertDialogTitle>
              <p className="mt-0.5 text-muted-foreground text-sm">{editingUser?.username}</p>
            </div>
          </div>

          <div className="space-y-6 px-6 py-5">
            <div className="divide-y rounded-md border text-sm">
              {[
                { label: 'Prénom', value: editingUser?.firstName },
                { label: 'Nom', value: editingUser?.lastName },
                { label: "Nom d'utilisateur", value: editingUser?.username },
                { label: 'Email', value: editingUser?.email },
                { label: 'Dernière connexion', value: formatLastConnection(editingUser?.lastConnection ?? null) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4 px-4 py-2.5">
                  <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm">Rôle</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as BaseUserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-medium text-sm">Actions</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Bloquer l'utilisateur
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if (editingUser) {
                      setConfirmDeleteId(editingUser.id);
                    }
                    closeEditDialog();
                  }}
                >
                  Supprimer l'utilisateur
                </Button>
                <Button variant="outline" className="justify-start">
                  Réinitialiser le mot de passe
                </Button>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="border-t bg-muted/20 px-6 py-4">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinishEdit}>Enregistrer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <AlertDialogHeader className="px-8 pt-8 pb-6">
            <AlertDialogTitle className="text-xl">Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-base">
              Cette action est irréversible. L'utilisateur sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t bg-muted/20 px-8 py-5">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
