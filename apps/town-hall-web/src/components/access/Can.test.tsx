import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Can } from './Can';

// ---------------------------------------------------------------------------
// Mock usePermissions
// ---------------------------------------------------------------------------

const mockPerms = vi.hoisted(() => ({
  isLoaded: true,
  hasPermission: vi.fn((k: string) => k === 'ARTICLE_PUBLISH_PERMISSION'),
  hasAnyPermission: vi.fn((ks: string[]) => ks.includes('ARTICLE_PUBLISH_PERMISSION')),
  hasAllPermissions: vi.fn((ks: string[]) => ks.every((k) => k === 'SIGNAL_VIEW_PERMISSION')),
  isAdmin: vi.fn(() => false),
}));

vi.mock('@/providers/PermissionProvider', () => ({
  usePermissions: () => mockPerms,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('<Can />', () => {
  it('rend children quand aucune contrainte', () => {
    render(<Can>visible</Can>);
    screen.getByText('visible');
  });

  it('rend fallback quand !isLoaded', () => {
    mockPerms.isLoaded = false;
    render(<Can permission="ARTICLE_PUBLISH_PERMISSION" fallback={<span>loading</span>}>hidden</Can>);
    screen.getByText('loading');
    expect(screen.queryByText('hidden')).toBeNull();
    mockPerms.isLoaded = true;
  });

  it('rend children quand permission accordee', () => {
    render(<Can permission="ARTICLE_PUBLISH_PERMISSION">ok</Can>);
    screen.getByText('ok');
  });

  it('rend fallback quand permission refusee', () => {
    render(<Can permission="ARTICLE_DELETE_PERMISSION" fallback={<span>nope</span>}>ok</Can>);
    screen.getByText('nope');
    expect(screen.queryByText('ok')).toBeNull();
  });

  it('rend children quand anyOf contient une permission accordee', () => {
    render(<Can anyOf={['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_DELETE_PERMISSION']}>ok</Can>);
    screen.getByText('ok');
  });

  it("rend fallback quand allOf n'est pas entierement satisfait", () => {
    render(<Can allOf={['ARTICLE_PUBLISH_PERMISSION', 'ARTICLE_DELETE_PERMISSION']} fallback={<span>nope</span>}>ok</Can>);
    screen.getByText('nope');
    expect(screen.queryByText('ok')).toBeNull();
  });

  it('rend children quand adminOnly et isAdmin === true', () => {
    mockPerms.isAdmin.mockReturnValueOnce(true);
    render(<Can adminOnly>admin content</Can>);
    screen.getByText('admin content');
  });

  it('rend fallback quand adminOnly et isAdmin === false', () => {
    render(<Can adminOnly fallback={<span>nope</span>}>admin content</Can>);
    screen.getByText('nope');
    expect(screen.queryByText('admin content')).toBeNull();
  });
});
