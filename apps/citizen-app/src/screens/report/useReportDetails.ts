import type { Report } from '@repo/contracts/report';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

export function useReportDetails(id: string) {
  const { reportService } = useServices();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void reportService
      .getById(id)
      .then((r) => {
        setReport(r);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, reportService]);

  const openCancelDialog = () => {
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
  };

  const confirmCancel = async () => {
    if (cancelling) {
      return;
    }
    setCancelling(true);
    try {
      const updated = await reportService.cancel(id);
      setReport(updated);
      setShowCancelDialog(false);
      router.back();
    } catch {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  return {
    report,
    loading,
    error,
    showCancelDialog,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    cancelling,
  };
}
