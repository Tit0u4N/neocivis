'use client';

import type { RoleDto, UserPublicDto } from '@repo/contracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useCityStore } from '@/stores/city.store';

type CreateForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

type CreateErrors = Partial<Record<keyof CreateForm, string>>;

const DEFAULT_CREATE_FORM: CreateForm = { firstName: '', lastName: '', username: '', email: '' };

function validateCreate(form: CreateForm): CreateErrors {
  const e: CreateErrors = {};
  if (!form.firstName.trim()) {
    e.firstName = 'Requis';
  }
  if (!form.lastName.trim()) {
    e.lastName = 'Requis';
  }
  if (!form.username.trim()) {
    e.username = 'Requis';
  }
  const email = form.email.trim();
  if (!email) {
    e.email = 'Requis';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    e.email = 'Email invalide';
  }
  return e;
}

export function useUserListPage() {
  const { cityService, accessService } = useServices();
  const cityId = useCityStore((s) => s.cityId);

  const [users, setUsers] = useState<UserPublicDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateFormState] = useState<CreateForm>(DEFAULT_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const [editingUser, setEditingUser] = useState<UserPublicDto | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [editInitialRoleIds, setEditInitialRoleIds] = useState<string[]>([]);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!cityId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [employees, allRoles] = await Promise.all([cityService.listEmployees(cityId), accessService.listRoles()]);
      setUsers(employees);
      setRoles(allRoles);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  }, [cityId, cityService, accessService]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter((u) => `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const openCreateDialog = useCallback(() => {
    setCreateFormState(DEFAULT_CREATE_FORM);
    setCreateErrors({});
    setShowCreateDialog(true);
  }, []);

  const closeCreateDialog = useCallback(() => setShowCreateDialog(false), []);

  const setCreateField = useCallback(<K extends keyof CreateForm>(key: K, value: CreateForm[K]) => {
    setCreateFormState((prev) => ({ ...prev, [key]: value }));
    setCreateErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!cityId) {
      return;
    }
    const errs = validateCreate(createForm);
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }
    setIsSubmittingCreate(true);
    try {
      await cityService.createAndAssignEmployee(cityId, {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        username: createForm.username.trim(),
        email: createForm.email.trim(),
      });
      await fetchData();
      setShowCreateDialog(false);
    } catch {
      setCreateErrors({ username: "Création impossible. Vérifiez que le nom d'utilisateur ou l'email ne sont pas déjà utilisés." });
    } finally {
      setIsSubmittingCreate(false);
    }
  }, [cityId, createForm, cityService, fetchData]);

  const openEditDialog = useCallback(
    async (user: UserPublicDto) => {
      setEditingUser(user);
      setEditRoleIds([]);
      setEditInitialRoleIds([]);
      setIsEditLoading(true);
      try {
        const res = await accessService.listEmployeeRoles(user.id);
        const ids = res.roles.map((r) => r.id);
        setEditRoleIds(ids);
        setEditInitialRoleIds(ids);
      } catch {
        setError("Impossible de charger les rôles de cet employé.");
        setEditingUser(null);
      } finally {
        setIsEditLoading(false);
      }
    },
    [accessService],
  );

  const closeEditDialog = useCallback(() => setEditingUser(null), []);

  const toggleEditRole = useCallback((roleId: string) => {
    setEditRoleIds((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));
  }, []);

  const handleFinishEdit = useCallback(async () => {
    if (!editingUser) {
      return;
    }
    const added = editRoleIds.filter((r) => !editInitialRoleIds.includes(r));
    const removed = editInitialRoleIds.filter((r) => !editRoleIds.includes(r));
    if (added.length === 0 && removed.length === 0) {
      setEditingUser(null);
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await Promise.all([
        ...added.map((r) => accessService.assignRole(editingUser.id, r)),
        ...removed.map((r) => accessService.unassignRole(editingUser.id, r)),
      ]);
      setEditingUser(null);
    } catch {
      setError("Impossible de mettre à jour les rôles de cet employé.");
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [editingUser, editRoleIds, editInitialRoleIds, accessService]);

  const handleDelete = useCallback(
    async (userId: number) => {
      if (!cityId) {
        return;
      }
      try {
        await cityService.unassignEmployee(cityId, userId);
        await fetchData();
        setConfirmDeleteId(null);
      } catch {
        setError("Impossible de retirer cet employé.");
        setConfirmDeleteId(null);
      }
    },
    [cityId, cityService, fetchData],
  );

  return {
    users: filteredUsers,
    roles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    showCreateDialog,
    createForm,
    createErrors,
    isSubmittingCreate,
    openCreateDialog,
    closeCreateDialog,
    setCreateField,
    handleCreate,
    editingUser,
    editRoleIds,
    editInitialRoleIds,
    isEditLoading,
    isSubmittingEdit,
    openEditDialog,
    closeEditDialog,
    toggleEditRole,
    handleFinishEdit,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
  };
}
