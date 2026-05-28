import type { Report } from '@repo/contracts/report';
import { ReportService } from '@repo/frontend-services/report';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

export function useReportDetails(id: string) {
  const api = useApi();
  const { cityId } = useCityStore();
  const reportService = useMemo(() => new ReportService(api, cityId), [api, cityId]);

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
