'use client';

import { create } from 'zustand';

type PermissionState = {
  permissions: string[];
  role: string | null;
  isLoaded: boolean;
};

type PermissionActions = {
  setPermissions: (permissions: string[]) => void;
  setRole: (role: string | null) => void;
  // Returns true always until real permissions are wired
  hasPermission: (permission: string) => boolean;
  // Returns true always until real permissions are wired
  hasAnyPermission: (permissions: string[]) => boolean;
  // Returns true always until real permissions are wired
  isAdmin: () => boolean;
  reset: () => void;
};

const initialState: PermissionState = {
  permissions: [],
  role: null,
  isLoaded: false,
};

export const usePermissionStore = create<PermissionState & PermissionActions>()((set) => ({
  ...initialState,

  setPermissions: (permissions) => set({ permissions, isLoaded: true }),

  setRole: (role) => set({ role }),

  // Stub — always returns true until API is wired
  hasPermission: (_permission) => true,

  // Stub — always returns true until API is wired
  hasAnyPermission: (_permissions) => true,

  // Stub — always returns true until API is wired
  isAdmin: () => true,

  reset: () => set(initialState),
}));
