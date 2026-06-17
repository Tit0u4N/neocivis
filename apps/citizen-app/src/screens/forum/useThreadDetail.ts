import type { UserPublicDto } from '@repo/contracts';
import type { ThreadDetail } from '@repo/contracts/thread';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useUserStore } from '@/stores/user.store';

export function useThreadDetail(threadId: string) {
  const { threadService, userService } = useServices();
  const { users, mergeUsers, getMissingIds } = useUserStore();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resolveAuthors = useCallback(
    async (data: ThreadDetail) => {
      const allIds = [data.authorId, ...data.messages.map((m) => m.authorId)];
      const missing = getMissingIds(Array.from(new Set(allIds)));
      if (missing.length === 0) {
        return;
      }
      try {
        const fetched = await userService.getByIds(missing);
        mergeUsers(fetched);
      } catch {
        // non-blocking
      }
    },
    [userService, getMissingIds, mergeUsers],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    void threadService
      .getById(threadId)
      .then((data) => {
        setThread(data);
        void resolveAuthors(data);
      })
      .catch(() => {
        setError('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [threadId, threadService, resolveAuthors]);

  const submitReply = () => {
    const body = replyBody.trim();
    if (!body || submitting) {
      return;
    }
    setSubmitting(true);
    void threadService
      .addMessage(threadId, { body })
      .then((message) => {
        setThread((prev) => {
          if (!prev) {
            return prev;
          }
          const updated = { ...prev, messages: [...prev.messages, message] };
          void resolveAuthors(updated);
          return updated;
        });
        setReplyBody('');
      })
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
      });
  };

  const resolveUser = useCallback((authorId: number): UserPublicDto | undefined => users[authorId], [users]);

  return { thread, loading, error, replyBody, setReplyBody, submitting, submitReply, resolveUser };
}
