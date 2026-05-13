import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Flag,
  LucideImageUpscale,
  MessageSquare,
  Newspaper,
  Settings2,
  Shield,
  Store,
  UserCog,
  Users,
  Webhook,
} from 'lucide-react';

export type SidebarItemConfig = {
  /** i18n key from common.json `sidebar.items.*` */
  labelKey: string;
  icon: LucideIcon;
  href: string;
  permissions?: string[];
  adminOnly?: boolean;
};

export type SidebarSectionConfig = {
  /** i18n key from common.json `sidebar.sections.*` */
  labelKey: string;
  items: SidebarItemConfig[];
};

export const SIDEBAR_SECTIONS: SidebarSectionConfig[] = [
  {
    labelKey: 'sidebar.sections.townHall',
    items: [
      { labelKey: 'sidebar.items.general', icon: FileText, href: '/dashboard/general' },
      { labelKey: 'sidebar.items.appManagement', icon: Settings2, href: '/dashboard/app-management' },
      { labelKey: 'sidebar.items.mediaGallery', icon: LucideImageUpscale, href: '/dashboard/media' },
      { labelKey: 'sidebar.items.establishment', icon: Store, href: '/dashboard/establishment' },
      { labelKey: 'sidebar.items.article', icon: Newspaper, href: '/dashboard/articles' },
    ],
  },
  {
    labelKey: 'sidebar.sections.report',
    items: [{ labelKey: 'sidebar.items.reports', icon: Flag, href: '/dashboard/reports' }],
  },
  {
    labelKey: 'sidebar.sections.forum',
    items: [
      { labelKey: 'sidebar.items.threads', icon: MessageSquare, href: '/dashboard/threads' },
      { labelKey: 'sidebar.items.userManagement', icon: UserCog, href: '/dashboard/forum/users' },
    ],
  },
  {
    labelKey: 'sidebar.sections.administrator',
    items: [
      { labelKey: 'sidebar.items.userManagement', icon: Users, href: '/dashboard/admin/users', adminOnly: true },
      { labelKey: 'sidebar.items.roleManagement', icon: Shield, href: '/dashboard/admin/roles', adminOnly: true },
      { labelKey: 'sidebar.items.webhook', icon: Webhook, href: '/dashboard/admin/webhooks', adminOnly: true },
    ],
  },
];
