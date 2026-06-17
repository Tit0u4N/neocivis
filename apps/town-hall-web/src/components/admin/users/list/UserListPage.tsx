'use client';

import type { RoleDto, UserPublicDto } from '@repo/contracts';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { useUserListPage } from './useUserListPage';

type Props = ReturnType<typeof useUserListPage>;

function getInitials(user: UserPublicDto) {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

function RolePicker({
  roles,
  selected,
  onToggle,
  isLoading,
}: Readonly<{
  roles: RoleDto[];
  selected: string[];
  onToggle: (roleId: string) => void;
  isLoading: boolean;
}>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <p className="rounded-md border px-4 py-3 text-muted-foreground text-sm">
        Aucun rôle configuré — créez des rôles dans la section Rôles.
      </p>
    );
  }

  return (
    <div className="space-y-1 rounded-md border p-2">
      {roles.map((role) => (
        <label key={role.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={selected.includes(role.id)}
            onChange={() => onToggle(role.id)}
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{role.name}</p>
            {role.description && <p className="text-muted-foreground text-xs">{role.description}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

function UserRow({
  user,
  userRoles,
  onEdit,
  onDeleteRequest,
}: Readonly<{
  user: UserPublicDto;
  userRoles: RoleDto[];
  onEdit: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.profilePictureUrl && <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />}
            <AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {userRoles.length === 0 ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : (
            userRoles.map((r) => (
              <Badge key={r.id} variant="secondary" className="text-xs">
                {r.name}
              </Badge>
            ))
          )}
        </div>
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
            <DropdownMenuItem onClick={onEdit}>Modifier les rôles</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
              Retirer de la mairie
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
    roles,
    employeeRoles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    editingUser,
    editRoleIds,
    isEditLoading,
    isSubmittingEdit,
    openEditDialog,
    closeEditDialog,
    toggleEditRole,
    handleFinishEdit,
    showCreateDialog,
    createForm,
    createErrors,
    isSubmittingCreate,
    openCreateDialog,
    closeCreateDialog,
    setCreateField,
    handleCreate,
  } = props;

  return (
    <PageLayout title="Gestion des employés">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{users.length} employé(s)</p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Ajouter un employé
        </Button>
      </div>

      <div className="flex items-center gap-3">
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilisateur</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rôles</th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3" colSpan={3}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={3}>
                  <p className="font-medium">Aucun utilisateur trouvé.</p>
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  userRoles={employeeRoles[user.id] ?? []}
                  onEdit={() => void openEditDialog(user)}
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
                  : 'Nouvel employé'}
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
          </div>

          <AlertDialogFooter className="border-t bg-muted/20 px-6 py-4">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleCreate()} disabled={isSubmittingCreate}>
              Créer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <AlertDialog open={editingUser !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <div className="flex items-center gap-4 border-b bg-muted/30 px-6 py-5">
            <Avatar size="lg">
              {editingUser?.profilePictureUrl && (
                <AvatarImage
                  src={editingUser.profilePictureUrl}
                  alt={editingUser ? `${editingUser.firstName} ${editingUser.lastName}` : ''}
                />
              )}
              <AvatarFallback className="bg-primary/15 font-bold text-primary text-sm">
                {editingUser ? getInitials(editingUser) : ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <AlertDialogTitle className="font-semibold text-base">
                {editingUser ? `${editingUser.firstName} ${editingUser.lastName}` : ''}
              </AlertDialogTitle>
              <p className="mt-0.5 text-muted-foreground text-sm">@{editingUser?.username}</p>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label className="font-medium text-sm">Rôles assignés</Label>
              <RolePicker roles={roles} selected={editRoleIds} onToggle={toggleEditRole} isLoading={isEditLoading} />
            </div>
          </div>

          <AlertDialogFooter className="border-t bg-muted/20 px-6 py-4">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleFinishEdit()} disabled={isSubmittingEdit || isEditLoading}>
              Enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="max-w-xl overflow-hidden p-0">
          <AlertDialogHeader className="px-8 pt-8 pb-6">
            <AlertDialogTitle className="text-xl">Retirer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-base">
              Cet employé sera retiré de la mairie. Son compte restera actif mais il n'aura plus accès à
              l'administration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t bg-muted/20 px-8 py-5">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId !== null && void handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
