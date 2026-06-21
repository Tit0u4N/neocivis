'use client';

import type { PermissionKey } from '@repo/contracts';
import type { ReactNode } from 'react';
import { usePermissions } from '@/providers/PermissionProvider';

type CanProps = {
  /** Exige exactement cette permission. */
  permission?: PermissionKey;
  /** Exige au moins une de ces permissions. */
  anyOf?: PermissionKey[];
  /** Exige toutes ces permissions. */
  allOf?: PermissionKey[];
  /** Exige role === 'ADMIN'. */
  adminOnly?: boolean;
  /** Rendu si le check échoue ou pendant le chargement (défaut : null). */
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Gate déclaratif : rend `children` si toutes les contraintes fournies sont
 * satisfaites, `fallback` sinon. Pendant `!isLoaded`, rend `fallback` pour
 * éviter un flash de contenu non gaté.
 *
 * @example
 * <Can permission="ARTICLE_PUBLISH_PERMISSION">
 *   <PublishButton />
 * </Can>
 *
 * @example
 * <Can anyOf={['ARTICLE_MODIFY_PERMISSION', 'ARTICLE_DELETE_PERMISSION']}>
 *   <EditMenu />
 * </Can>
 */
export function Can({ permission, anyOf, allOf, adminOnly, fallback = null, children }: CanProps) {
  const { isLoaded, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();

  if (!isLoaded) {
    return fallback;
  }

  const checks: boolean[] = [];

  if (adminOnly) {
    checks.push(isAdmin());
  }
  if (permission !== undefined) {
    checks.push(hasPermission(permission));
  }
  if (anyOf !== undefined && anyOf.length > 0) {
    checks.push(hasAnyPermission(anyOf));
  }
  if (allOf !== undefined && allOf.length > 0) {
    checks.push(hasAllPermissions(allOf));
  }

  const allowed = checks.length === 0 || checks.every(Boolean);

  return allowed ? children : fallback;
}
