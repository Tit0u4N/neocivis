'use client';

import type { BaseUserRole, PermissionKey } from '@repo/contracts';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

type PermissionContextValue = {
  permissions: PermissionKey[];
  role: BaseUserRole | null;
  isLoaded: boolean;
  hasPermission: (key: PermissionKey) => boolean;
  hasAnyPermission: (keys: PermissionKey[]) => boolean;
  hasAllPermissions: (keys: PermissionKey[]) => boolean;
  isAdmin: () => boolean;
};

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { userService } = useServices();
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [role, setRole] = useState<BaseUserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    userService.getMe().then((me) => {
      setPermissions(me.permissions);
      setRole(me.role);
      setIsLoaded(true);
    });
  }, [userService]);

  const value: PermissionContextValue = {
    permissions,
    role,
    isLoaded,
    hasPermission: (key) => role === 'ADMIN' || permissions.includes(key),
    hasAnyPermission: (keys) => role === 'ADMIN' || keys.some((k) => permissions.includes(k)),
    hasAllPermissions: (keys) => role === 'ADMIN' || keys.every((k) => permissions.includes(k)),
    isAdmin: () => role === 'ADMIN',
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used inside PermissionProvider');
  }
  return context;
}
