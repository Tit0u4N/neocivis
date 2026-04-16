'use client';

import { usePathname } from 'next/navigation';
import type { SidebarSectionConfig } from '@/components/sidebar/sidebar.config';
import { SIDEBAR_SECTIONS } from '@/components/sidebar/sidebar.config';
import { usePermission } from '@/hooks/usePermission';

export type AppSidebarViewModel = {
  visibleSections: SidebarSectionConfig[];
  isActive: (href: string) => boolean;
};

export function useAppSidebar(): AppSidebarViewModel {
  const pathname = usePathname();
  const { hasAnyPermission, isAdmin } = usePermission();

  const visibleSections = SIDEBAR_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.adminOnly) {
        return isAdmin();
      }
      if (item.permissions?.length) {
        return hasAnyPermission(item.permissions);
      }
      return true;
    }),
  })).filter((section) => section.items.length > 0);

  const isActive = (href: string) => pathname === href;

  return { visibleSections, isActive };
}
