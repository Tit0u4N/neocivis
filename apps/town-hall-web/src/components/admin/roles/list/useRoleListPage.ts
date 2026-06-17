'use client';

import type { PermissionKey, RoleDto } from '@repo/contracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

type RoleForm = {
  name: string;
  description: string;
  permissions: PermissionKey[];
};

type FormErrors = Partial<Record<keyof RoleForm, string>>;

const DEFAULT_FORM: RoleForm = { name: '', description: '', permissions: [] };

function validateForm(form: RoleForm): FormErrors {
  const errors: FormErrors = {};
  const trimmed = form.name.trim();
  if (!trimmed) {
    errors.name = 'Requis';
  } else if (trimmed.length < 2) {
    errors.name = 'Minimum 2 caractères';
  } else if (trimmed.length > 80) {
    errors.name = 'Maximum 80 caractères';
  }
  if (form.description.length > 500) {
    errors.description = 'Maximum 500 caractères';
  }
  return errors;
}

export function useRoleListPage() {
  const { accessService } = useServices();
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateFormState] = useState<RoleForm>(DEFAULT_FORM);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [editForm, setEditFormState] = useState<RoleForm>(DEFAULT_FORM);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedRoles, catalog] = await Promise.all([
        accessService.listRoles(),
        accessService.listPermissionCatalog(),
      ]);
      setRoles(fetchedRoles);
      setPermissionCatalog(catalog.map((p) => p.key));
    } catch {
      setError('Impossible de charger les rôles.');
    } finally {
      setIsLoading(false);
    }
  }, [accessService]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredRoles = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [roles, searchQuery],
  );

  // Create dialog
  const openCreateDialog = useCallback(() => {
    setCreateFormState(DEFAULT_FORM);
    setCreateErrors({});
    setShowCreateDialog(true);
  }, []);

  const closeCreateDialog = useCallback(() => setShowCreateDialog(false), []);

  const setCreateField = useCallback(<K extends keyof RoleForm>(key: K, value: RoleForm[K]) => {
    setCreateFormState((prev) => ({ ...prev, [key]: value }));
    setCreateErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const toggleCreatePermission = useCallback((key: PermissionKey) => {
    setCreateFormState((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  }, []);

  const handleCreate = useCallback(async () => {
    const errors = validateForm(createForm);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setIsSubmittingCreate(true);
    try {
      await accessService.createRole({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        permissions: createForm.permissions,
      });
      await fetchData();
      setShowCreateDialog(false);
    } catch {
      setCreateErrors({ name: 'Ce nom est déjà utilisé par un autre rôle.' });
    } finally {
      setIsSubmittingCreate(false);
    }
  }, [createForm, accessService, fetchData]);

  // Edit dialog
  const openEditDialog = useCallback((role: RoleDto) => {
    setEditingRole(role);
    setEditFormState({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setEditErrors({});
  }, []);

  const closeEditDialog = useCallback(() => setEditingRole(null), []);

  const setEditField = useCallback(<K extends keyof RoleForm>(key: K, value: RoleForm[K]) => {
    setEditFormState((prev) => ({ ...prev, [key]: value }));
    setEditErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const toggleEditPermission = useCallback((key: PermissionKey) => {
    setEditFormState((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  }, []);

  const handleFinishEdit = useCallback(async () => {
    if (!editingRole) {
      return;
    }
    const errors = validateForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await accessService.updateRole(editingRole.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        permissions: editForm.permissions,
      });
      await fetchData();
      setEditingRole(null);
    } catch {
      setEditErrors({ name: "Mise à jour impossible. Vérifiez que le nom n'est pas déjà utilisé." });
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [editingRole, editForm, accessService, fetchData]);

  // Delete
  const handleDelete = useCallback(
    async (roleId: string) => {
      setIsDeleting(true);
      try {
        await accessService.deleteRole(roleId);
        await fetchData();
        setConfirmDeleteId(null);
      } catch {
        setError('Impossible de supprimer ce rôle.');
        setConfirmDeleteId(null);
      } finally {
        setIsDeleting(false);
      }
    },
    [accessService, fetchData],
  );

  return {
    roles: filteredRoles,
    permissionCatalog,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    isDeleting,
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
  };
}
