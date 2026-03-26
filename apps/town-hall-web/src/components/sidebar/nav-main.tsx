'use client';

import Link from 'next/link';
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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarMenu>
        {section.items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} />}
              isActive={isActive(item.href)}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
