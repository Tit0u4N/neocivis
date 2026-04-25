'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { SidebarSectionConfig } from '@/components/sidebar/sidebar.config';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavSectionProps = {
  section: SidebarSectionConfig;
  isActive: (href: string) => boolean;
};

export function NavSection({ section, isActive }: NavSectionProps) {
  const { t } = useTranslation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
      <SidebarMenu>
        {section.items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} />}
              isActive={isActive(item.href)}
              tooltip={t(item.labelKey)}
            >
              <item.icon />
              <span>{t(item.labelKey)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
