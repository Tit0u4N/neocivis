'use client';

import type { ForumUserModeration, ThreadCategory, ThreadDetail } from '@repo/contracts/thread';
import { useCallback, useEffect, useState } from 'react';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useServices } from '@/providers/ServicesProvider';

export function useThreadDetailPage(threadId: string) {
  const { threadService } = useServices();
  const { user } = useAuthentication();
  const currentUserId = user?.profile.sub ?? '';

  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [categories, setCategories] = useState<ThreadCategory[]>([]);
  const [moderation, setModeration] = useState<ForumUserModeration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showDeletedMessages, setShowDeletedMessages] = useState(false);

  const fetchThread = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await threadService.getById(threadId);
      setThread(data);
    } catch {
      setError('threads.detail.error');
    } finally {
      setIsLoading(false);
    }
  }, [threadService.getById, threadId]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await threadService.getCategories();
      setCategories(data);
    } catch {
      // Non-blocking
    }
  }, [threadService.getCategories]);

  const fetchModeration = useCallback(async () => {
    try {
      const data = await threadService.getModeration();
      setModeration(data);
    } catch {
      // Non-blocking
    }
  }, [threadService.getModeration]);

  useEffect(() => {
    void fetchThread();
    void fetchCategories();
    void fetchModeration();
  }, [fetchThread, fetchCategories, fetchModeration]);

  const getModerationForUser = useCallback(
    (userId: string): ForumUserModeration | undefined => moderation.find((m) => m.userId === userId),
    [moderation],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await threadService.softDeleteMessage(threadId, messageId);
        await fetchThread();
      } catch {
        // Silently fail; UI state unchanged
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
        // Silently fail
      }
    },
    [threadService.restoreMessage, threadId, fetchThread],
  );

  const handleDeleteThread = useCallback(async () => {
    try {
      await threadService.softDelete(threadId);
      await fetchThread();
    } catch {
      // Silently fail
    }
  }, [threadService.softDelete, threadId, fetchThread]);

  const handleRestoreThread = useCallback(async () => {
    try {
      await threadService.restore(threadId);
      await fetchThread();
    } catch {
      // Silently fail
    }
  }, [threadService.restore, threadId, fetchThread]);

  const handleArchiveThread = useCallback(async () => {
    try {
      await threadService.archive(threadId);
      await fetchThread();
    } catch {
      // Silently fail
    }
  }, [threadService.archive, threadId, fetchThread]);

  const handleUnarchiveThread = useCallback(async () => {
    try {
      await threadService.unarchive(threadId);
      await fetchThread();
    } catch {
      // Silently fail
    }
  }, [threadService.unarchive, threadId, fetchThread]);

  const handleToggleMute = useCallback(
    async (userId: string, currentlyMuted: boolean) => {
      try {
        if (currentlyMuted) {
          await threadService.unmuteUser(userId);
        } else {
          await threadService.muteUser(userId);
        }
        await fetchModeration();
      } catch {
        // Silently fail
      }
    },
    [threadService.muteUser, threadService.unmuteUser, fetchModeration],
  );

  const handleToggleBan = useCallback(
    async (userId: string, currentlyBanned: boolean) => {
      try {
        if (currentlyBanned) {
          await threadService.unbanUser(userId);
        } else {
          await threadService.banUser(userId);
        }
        await fetchModeration();
      } catch {
        // Silently fail
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
        // Silently fail
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
      // Silently fail
    } finally {
      setIsReplying(false);
    }
  }, [threadService.addMessage, threadId, replyBody, fetchThread]);

  const toggleShowDeletedMessages = useCallback(() => {
    setShowDeletedMessages((prev) => !prev);
  }, []);

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
  };
}
