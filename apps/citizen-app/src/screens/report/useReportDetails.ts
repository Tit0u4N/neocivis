import { router } from 'expo-router';
import { useState } from 'react';
import { type Report, SEED_REPORTS } from './report.types';

export function useReportDetails(id: string) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const report: Report | null = SEED_REPORTS.find((r) => r.id === id) ?? null;

  const openCancelDialog = () => {
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    router.back();
  };

  return { report, showCancelDialog, openCancelDialog, closeCancelDialog, confirmCancel };
}
