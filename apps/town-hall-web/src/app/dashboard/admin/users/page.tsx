'use client';

import { UserListPage } from '@/components/admin/users/list/UserListPage';
import { useUserListPage } from '@/components/admin/users/list/useUserListPage';

export default function AdminUsersPage() {
  const vm = useUserListPage();
  return <UserListPage {...vm} />;
}
