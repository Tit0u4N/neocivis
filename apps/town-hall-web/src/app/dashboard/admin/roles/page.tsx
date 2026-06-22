'use client';

import { RoleListPage } from '@/components/admin/roles/list/RoleListPage';
import { useRoleListPage } from '@/components/admin/roles/list/useRoleListPage';

export default function AdminRolesPage() {
  const vm = useRoleListPage();
  return <RoleListPage {...vm} />;
}
