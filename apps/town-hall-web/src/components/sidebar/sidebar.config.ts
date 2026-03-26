import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Flag,
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
  label: string;
  icon: LucideIcon;
  href: string;
  permissions?: string[];
  adminOnly?: boolean;
};

export type SidebarSectionConfig = {
  label: string;
  items: SidebarItemConfig[];
};

export const SIDEBAR_SECTIONS: SidebarSectionConfig[] = [
  {
    label: 'Town Hall',
    items: [
      { label: 'General', icon: FileText, href: '/dashboard/general' },
      { label: 'App management', icon: Settings2, href: '/dashboard/app-management' },
      { label: 'Establishment', icon: Store, href: '/dashboard/establishment' },
      { label: 'Article', icon: Newspaper, href: '/dashboard/article' },
    ],
  },
  {
    label: 'Report',
    items: [{ label: 'Reports', icon: Flag, href: '/dashboard/reports' }],
  },
  {
    label: 'Forum',
    items: [
      { label: 'Threads', icon: MessageSquare, href: '/dashboard/threads' },
      { label: 'User management', icon: UserCog, href: '/dashboard/forum/users' },
    ],
  },
  {
    label: 'Administrator',
    items: [
      { label: 'User management', icon: Users, href: '/dashboard/admin/users', adminOnly: true },
      { label: 'Role management', icon: Shield, href: '/dashboard/admin/roles', adminOnly: true },
      { label: 'Webhook', icon: Webhook, href: '/dashboard/admin/webhooks', adminOnly: true },
    ],
  },
];
