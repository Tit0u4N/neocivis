'use client';

import type { BaseUserRole } from '@repo/contracts/user';
import { useCallback, useMemo, useState } from 'react';

export type AdminUserDto = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: BaseUserRole;
  lastConnection: string | null;
};

type CreateForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: BaseUserRole;
};

type CreateErrors = Partial<Record<keyof CreateForm, string>>;

const DEFAULT_CREATE_FORM: CreateForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  role: 'EMPLOYEE',
};

const MOCK_USERS: AdminUserDto[] = [
  {
    id: 1,
    username: 'alice.martin',
    email: 'alice.martin@mairie.fr',
    firstName: 'Alice',
    lastName: 'Martin',
    role: 'ADMIN',
    lastConnection: '2026-05-10T08:32:00Z',
  },
  {
    id: 2,
    username: 'bob.dupont',
    email: 'bob.dupont@mairie.fr',
    firstName: 'Bob',
    lastName: 'Dupont',
    role: 'EMPLOYEE',
    lastConnection: '2026-05-09T14:15:00Z',
  },
  {
    id: 3,
    username: 'claire.bernard',
    email: 'claire.bernard@mairie.fr',
    firstName: 'Claire',
    lastName: 'Bernard',
    role: 'EMPLOYEE',
    lastConnection: '2026-04-28T09:00:00Z',
  },
  {
    id: 4,
    username: 'david.moreau',
    email: 'david.moreau@mairie.fr',
    firstName: 'David',
    lastName: 'Moreau',
    role: 'EMPLOYEE',
    lastConnection: null,
  },
];

export function useUserListPage() {
  const [users, setUsers] = useState<AdminUserDto[]>(MOCK_USERS);
  const [isLoading, _setIsLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<BaseUserRole | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
  const [editRole, setEditRole] = useState<BaseUserRole>('EMPLOYEE');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateFormState] = useState<CreateForm>(DEFAULT_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const fullName = `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const openEditDialog = useCallback((user: AdminUserDto) => {
    setEditingUser(user);
    setEditRole(user.role);
  }, []);

  const closeEditDialog = useCallback(() => setEditingUser(null), []);

  const handleFinishEdit = useCallback(() => {
    if (!editingUser) {
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, role: editRole } : u)));
    setEditingUser(null);
  }, [editingUser, editRole]);

  const handleDelete = useCallback((id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDeleteId(null);
  }, []);

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

  const handleCreate = useCallback(() => {
    const errors: CreateErrors = {};
    if (!createForm.firstName.trim()) {
      errors.firstName = 'Requis';
    }
    if (!createForm.lastName.trim()) {
      errors.lastName = 'Requis';
    }
    if (!createForm.username.trim()) {
      errors.username = 'Requis';
    }
    if (!createForm.email.trim()) {
      errors.email = 'Requis';
    }
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    const newUser: AdminUserDto = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      ...createForm,
      lastConnection: null,
    };
    setUsers((prev) => [...prev, newUser]);
    setShowCreateDialog(false);
  }, [createForm, users]);

  return {
    users: filteredUsers,
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
  };
}
