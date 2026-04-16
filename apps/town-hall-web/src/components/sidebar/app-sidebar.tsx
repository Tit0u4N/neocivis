'use client';

import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavSection } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import { useAppSidebar } from '@/components/sidebar/useAppSidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Placeholder user — replace with auth context when wired
const CURRENT_USER = {
  name: 'Admin',
  email: 'admin@neocivis.fr',
  avatar: '',
};

export function AppSidebar() {
  const { t } = useTranslation();
  const { visibleSections, isActive } = useAppSidebar();
  const municipalityName = t('app.shortName');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={municipalityName}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <span className="truncate font-semibold">{municipalityName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {visibleSections.map((section) => (
          <NavSection key={section.labelKey} section={section} isActive={isActive} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={CURRENT_USER} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
