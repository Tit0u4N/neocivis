'use client';

import type { ReactNode } from 'react';
import { CityGate } from '@/components/city/CityGate';

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <CityGate>{children}</CityGate>;
}
