'use client';

import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

export function useThreadListPage() {
  const router = useRouter();
  const { threadService } = useServices();

  const [categories, setCategories] = useState<ThreadCategory[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [mutedCount, setMutedCount] = useState(0);
  const [bannedCount, setBannedCount] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await threadService.getCategories();
      setCategories(data);
    } catch {
      // Non-blocking; category filter won't show but threads still work
    }
  }, [threadService.getCategories]);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await threadService.getAll(activeCategoryId);
      setThreads(data);
    } catch {
      setError('threads.list.error');
    } finally {
      setIsLoading(false);
    }
  }, [threadService.getAll, activeCategoryId]);

  const fetchModeration = useCallback(async () => {
    try {
      const data = await threadService.getModeration();
      setMutedCount(data.filter((m) => m.muted).length);
      setBannedCount(data.filter((m) => m.banned).length);
    } catch {
      // Non-blocking
    }
  }, [threadService.getModeration]);

  useEffect(() => {
    void fetchCategories();
    void fetchModeration();
  }, [fetchCategories, fetchModeration]);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  const handleSelectCategory = useCallback((id: string | undefined) => {
    setActiveCategoryId(id);
  }, []);

  const handleOpenNewThread = useCallback(() => {
    setShowNewThreadModal(true);
  }, []);

  const handleCloseNewThread = useCallback(() => {
    setShowNewThreadModal(false);
  }, []);

  const handleThreadCreated = useCallback(async () => {
    setShowNewThreadModal(false);
    await fetchThreads();
    await fetchModeration();
  }, [fetchThreads, fetchModeration]);

  const navigateToThread = useCallback(
    (id: string) => {
      router.push(`/dashboard/threads/${id}`);
    },
    [router],
  );

  return {
    categories,
    threads,
    activeCategoryId,
    isLoading,
    error,
    showNewThreadModal,
    mutedCount,
    bannedCount,
    handleSelectCategory,
    handleOpenNewThread,
    handleCloseNewThread,
    handleThreadCreated,
    navigateToThread,
  };
}
