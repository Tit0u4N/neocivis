'use client';

import { AppManagementPage } from '@/components/app-management/AppManagementPage';
import { useAppManagementPage } from '@/components/app-management/useAppManagementPage';

export default function AppManagementRoute() {
  const vm = useAppManagementPage();
  return <AppManagementPage {...vm} />;
}
