'use client';

import { usePermissionStore } from '@/stores/permission.store';

/**
 * Exposes permission checks from the store.
 * All checks return true until real permissions are wired from the API.
 */
export function usePermission() {
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const hasAnyPermission = usePermissionStore((s) => s.hasAnyPermission);
  const isAdmin = usePermissionStore((s) => s.isAdmin);
  const isLoaded = usePermissionStore((s) => s.isLoaded);

  return { hasPermission, hasAnyPermission, isAdmin, isLoaded };
}
