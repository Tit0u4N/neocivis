import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUserService = { getMe: vi.fn() };
vi.mock('@/providers/ServicesProvider', () => ({
  useServices: () => ({ userService: mockUserService }),
}));

import { PermissionProvider, usePermissions } from './PermissionProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PermissionProvider>{children}</PermissionProvider>
);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ME_EMPLOYEE = {
  id: 1,
  username: 'emp',
  email: 'emp@city.fr',
  firstName: 'E',
  lastName: 'P',
  role: 'EMPLOYEE' as const,
  profilePictureUrl: null,
  memberships: [],
  roles: [],
  permissions: ['ARTICLE_PUBLISH_PERMISSION', 'SIGNAL_VIEW_PERMISSION'] as const,
};

const ME_ADMIN = { ...ME_EMPLOYEE, role: 'ADMIN' as const, permissions: [] as const };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PermissionProvider / usePermissions', () => {
  it('isLoaded est false au départ puis true après fetch', async () => {
    mockUserService.getMe.mockResolvedValue(ME_EMPLOYEE);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isLoaded).toBe(false);
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
  });

  it("expose les permissions de l'employe", async () => {
    mockUserService.getMe.mockResolvedValue(ME_EMPLOYEE);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.hasPermission('ARTICLE_PUBLISH_PERMISSION')).toBe(true);
    expect(result.current.hasPermission('ARTICLE_DELETE_PERMISSION')).toBe(false);
    expect(result.current.isAdmin()).toBe(false);
  });

  it('hasAnyPermission retourne true si au moins une clé est présente', async () => {
    mockUserService.getMe.mockResolvedValue(ME_EMPLOYEE);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.hasAnyPermission(['ARTICLE_DELETE_PERMISSION', 'SIGNAL_VIEW_PERMISSION'])).toBe(true);
    expect(result.current.hasAnyPermission(['ARTICLE_DELETE_PERMISSION', 'MEDIA_UPLOAD_PERMISSION'])).toBe(false);
  });

  it('hasAllPermissions retourne true seulement si toutes les clés sont présentes', async () => {
    mockUserService.getMe.mockResolvedValue(ME_EMPLOYEE);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.hasAllPermissions(['ARTICLE_PUBLISH_PERMISSION', 'SIGNAL_VIEW_PERMISSION'])).toBe(true);
    expect(result.current.hasAllPermissions(['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_DELETE_PERMISSION'])).toBe(false);
  });

  it('ADMIN bypass — toutes les permissions retournent true', async () => {
    mockUserService.getMe.mockResolvedValue(ME_ADMIN);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.hasPermission('ARTICLE_DELETE_PERMISSION')).toBe(true);
    expect(result.current.hasAnyPermission(['MEDIA_DELETE_PERMISSION'])).toBe(true);
    expect(result.current.hasAllPermissions(['ESTABLISHMENT_CREATE_PERMISSION', 'MEDIA_DELETE_PERMISSION'])).toBe(true);
  });
});
