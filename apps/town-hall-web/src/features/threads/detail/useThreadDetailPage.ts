'use client';

import type { UserPublicDto } from '@repo/contracts';
import type { ForumUserModeration, ThreadDetail } from '@repo/contracts/thread';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useThreadStore } from '@/stores/thread.store';
import { useUserStore } from '@/stores/user.store';

export function useThreadDetailPage(threadId: string) {
  const router = useRouter();
  const { threadService, userService } = useServices();

  // Stable action selectors — Zustand guarantees same function ref across renders
  const setCategories = useThreadStore((s) => s.setCategories);
  const setModeration = useThreadStore((s) => s.setModeration);
  const mergeUsers = useUserStore((s) => s.mergeUsers);
  const getMissingIds = useUserStore((s) => s.getMissingIds);

  // Data selectors
  const categories = useThreadStore((s) => s.categories);
  const moderation = useThreadStore((s) => s.moderation);
  const users = useUserStore((s) => s.users);

  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showDeletedMessages, setShowDeletedMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  useEffect(() => {
    userService
      .getMe()
      .then((me) => setCurrentUserId(me.id))
      .catch(() => {});
  }, [userService.getMe]);

  const fetchThread = useCallback(async () => {
    if (!initialLoadDone.current) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await threadService.getById(threadId);
      setThread(data);
      initialLoadDone.current = true;

      const allAuthorIds = [data.authorId, ...data.messages.map((m) => m.authorId)];
      const unique = Array.from(new Set(allAuthorIds));
      const missing = getMissingIds(unique);
      if (missing.length > 0) {
        const fetched = await userService.getByIds(missing);
        mergeUsers(fetched);
      }
    } catch {
      setError('threads.detail.error');
    } finally {
      setIsLoading(false);
    }
  }, [threadService.getById, threadId, userService.getByIds, getMissingIds, mergeUsers]);

  const fetchCategories = useCallback(async () => {
    if (useThreadStore.getState().categories.length > 0) {
      return;
    }
    try {
      const data = await threadService.getCategories();
      setCategories(data);
    } catch {
      // Non-blocking
    }
  }, [threadService.getCategories, setCategories]);

  const fetchModeration = useCallback(async () => {
    try {
      const data = await threadService.getModeration();
      setModeration(data);
    } catch {
      // Non-blocking
    }
  }, [threadService.getModeration, setModeration]);

  useEffect(() => {
    void fetchThread();
    void fetchCategories();
    void fetchModeration();
  }, [fetchThread, fetchCategories, fetchModeration]);

  const getModerationForUser = useCallback(
    (userId: number): ForumUserModeration | undefined => moderation.find((m) => m.userId === userId),
    [moderation],
  );

  const resolveUser = useCallback((authorId: number): UserPublicDto | undefined => users[authorId], [users]);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await threadService.softDeleteMessage(threadId, messageId);
        await fetchThread();
      } catch {
        // TODO add user feedback; UI state unchanged
      }
    },
    [threadService.softDeleteMessage, threadId, fetchThread],
  );

  const handleRestoreMessage = useCallback(
    async (messageId: string) => {
      try {
        await threadService.restoreMessage(threadId, messageId);
        await fetchThread();
      } catch {
        // TODO add user feedback
      }
    },
    [threadService.restoreMessage, threadId, fetchThread],
  );

  const handleDeleteThread = useCallback(async () => {
    try {
      await threadService.softDelete(threadId);
      await fetchThread();
    } catch {
      // TODO add user feedback
    }
  }, [threadService.softDelete, threadId, fetchThread]);

  const handleRestoreThread = useCallback(async () => {
    try {
      await threadService.restore(threadId);
      await fetchThread();
    } catch {
      // TODO add user feedback
    }
  }, [threadService.restore, threadId, fetchThread]);

  const handleArchiveThread = useCallback(async () => {
    try {
      await threadService.archive(threadId);
      await fetchThread();
    } catch {
      // TODO add user feedback
    }
  }, [threadService.archive, threadId, fetchThread]);

  const handleUnarchiveThread = useCallback(async () => {
    try {
      await threadService.unarchive(threadId);
      await fetchThread();
    } catch {
      // TODO add user feedback
    }
  }, [threadService.unarchive, threadId, fetchThread]);

  const handleToggleMute = useCallback(
    async (userId: number, currentlyMuted: boolean) => {
      try {
        if (currentlyMuted) {
          await threadService.unmuteUser(userId);
        } else {
          await threadService.muteUser(userId);
        }
        await fetchModeration();
      } catch {
        // TODO add user feedback
      }
    },
    [threadService.muteUser, threadService.unmuteUser, fetchModeration],
  );

  const handleToggleBan = useCallback(
    async (userId: number, currentlyBanned: boolean) => {
      try {
        if (currentlyBanned) {
          await threadService.unbanUser(userId);
        } else {
          await threadService.banUser(userId);
        }
        await fetchModeration();
      } catch {
        // TODO add user feedback
      }
    },
    [threadService.banUser, threadService.unbanUser, fetchModeration],
  );

  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!thread) {
        return;
      }
      const message = thread.messages.find((m) => m.id === messageId);
      if (!message) {
        return;
      }
      const existingBucket = message.reactions.find((r) => r.emoji === emoji);
      const alreadyReacted = existingBucket?.userIds.includes(currentUserId) ?? false;
      try {
        if (alreadyReacted) {
          await threadService.removeReaction(threadId, messageId, emoji);
        } else {
          await threadService.addReaction(threadId, messageId, { emoji });
        }
        await fetchThread();
      } catch {
        // TODO add user feedback
      }
    },
    [thread, currentUserId, threadService.addReaction, threadService.removeReaction, threadId, fetchThread],
  );

  const handleSubmitReply = useCallback(async () => {
    const body = replyBody.trim();
    if (!body) {
      return;
    }
    setIsReplying(true);
    try {
      await threadService.addMessage(threadId, { body });
      setReplyBody('');
      await fetchThread();
    } catch {
      // TODO add user feedback
    } finally {
      setIsReplying(false);
    }
  }, [threadService.addMessage, threadId, replyBody, fetchThread]);

  const toggleShowDeletedMessages = useCallback(() => {
    setShowDeletedMessages((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/dashboard/threads');
  }, [router]);

  return {
    thread,
    categories,
    currentUserId,
    isLoading,
    error,
    replyBody,
    setReplyBody,
    isReplying,
    showDeletedMessages,
    getModerationForUser,
    resolveUser,
    handleDeleteMessage,
    handleRestoreMessage,
    handleDeleteThread,
    handleRestoreThread,
    handleArchiveThread,
    handleUnarchiveThread,
    handleToggleMute,
    handleToggleBan,
    handleToggleReaction,
    handleSubmitReply,
    toggleShowDeletedMessages,
    handleBack,
  };
}
