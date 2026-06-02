'use client';

import type { ThreadCategory, ThreadMessage, ThreadReaction } from '@repo/contracts/thread';
import { ChevronDown, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/ui/page-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { CategoryBadge } from '@/features/threads/components/CategoryBadge';
import type { ModMenuItem } from '@/features/threads/components/ModMenu';
import { ModMenu } from '@/features/threads/components/ModMenu';
import { getInitials, ThreadAvatar } from '@/features/threads/components/ThreadAvatar';
import { UserStatusBadge } from '@/features/threads/components/UserStatusBadge';
import type { useThreadDetailPage } from './useThreadDetailPage';

type Props = ReturnType<typeof useThreadDetailPage>;

const PRESET_EMOJIS = ['👍', '❤️', '😄', '🎉'];

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) {
    return `${Math.floor(diff / 60_000)}min`;
  }
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}j` : new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── ReactionChips ────────────────────────────────────────────────────────────

type ReactionChipsProps = {
  reactions: ThreadReaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
};

function ReactionChips({ reactions, currentUserId, onToggle }: ReactionChipsProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {reactions.map((r) => {
        const mine = r.userIds.includes(currentUserId);
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggle(r.emoji)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
              mine
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <span>{r.emoji}</span>
            <span className="font-medium tabular-nums">{r.userIds.length}</span>
          </button>
        );
      })}
      {/* Preset emoji add shortcuts */}
      {PRESET_EMOJIS.filter((e) => !reactions.some((r) => r.emoji === e)).map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onToggle(e)}
          title={t('threads.detail.addReaction')}
          className="flex items-center gap-1 rounded-full border border-border border-dashed px-2 py-0.5 text-muted-foreground text-xs opacity-50 transition-colors hover:border-border hover:opacity-100"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ── MessageRow ───────────────────────────────────────────────────────────────

type MessageRowProps = {
  message: ThreadMessage;
  currentUserId: string;
  onDelete: () => void;
  onToggleMute: () => void;
  onToggleBan: () => void;
  onToggleReaction: (emoji: string) => void;
  muted: boolean;
  banned: boolean;
};

function MessageRow({
  message,
  currentUserId,
  onDelete,
  onToggleMute,
  onToggleBan,
  onToggleReaction,
  muted,
  banned,
}: MessageRowProps) {
  const { t } = useTranslation();
  // TODO: resolve display name via users API
  const initials = getInitials(message.authorId);

  const modItems: ModMenuItem[] = [
    {
      label: t('threads.moderation.deleteMessage'),
      onClick: onDelete,
      variant: 'destructive',
    },
    { divider: true },
    {
      label: muted ? t('threads.moderation.unmute') : t('threads.moderation.mute'),
      onClick: onToggleMute,
    },
    {
      label: banned ? t('threads.moderation.unban') : t('threads.moderation.ban'),
      onClick: onToggleBan,
      variant: 'destructive',
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <ThreadAvatar initials={initials} size="sm" />
        {/* TODO: resolve display name via users API */}
        <span className="font-mono font-semibold text-muted-foreground text-xs">{message.authorId}</span>
        <UserStatusBadge muted={muted} banned={banned} />
        <span className="ml-auto text-muted-foreground text-xs">
          {formatTime(message.createdAt)} · {formatRelative(message.createdAt)}
        </span>
        <ModMenu items={modItems} />
      </div>
      <p className={`text-sm leading-relaxed ${banned ? 'text-muted-foreground' : 'text-foreground'}`}>
        {message.body}
      </p>
      <ReactionChips reactions={message.reactions} currentUserId={currentUserId} onToggle={onToggleReaction} />
    </div>
  );
}

// ── DeletedMessageRow ─────────────────────────────────────────────────────────

function DeletedMessageRow({ message, onRestore }: { message: ThreadMessage; onRestore: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border border-dashed bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          {/* TODO: resolve display name via users API */}
          <span className="font-mono font-semibold text-muted-foreground text-xs">{message.authorId}</span>
          <span className="text-[10px] text-muted-foreground">
            {t('threads.moderation.deletedAt', {
              date: message.deletedAt ? formatRelative(message.deletedAt) : 'maintenant',
            })}
          </span>
        </div>
        <p className="truncate text-muted-foreground text-xs italic line-through">{message.body}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRestore} className="shrink-0 gap-1.5">
        <RotateCcw className="size-3" />
        {t('threads.detail.restore')}
      </Button>
    </div>
  );
}

// ── ThreadDetailPage ──────────────────────────────────────────────────────────

export function ThreadDetailPage(props: Props) {
  const { t } = useTranslation();
  const {
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
  } = props;

  const categoryMap = new Map<string, ThreadCategory>(categories.map((c) => [c.id, c]));

  if (isLoading) {
    return (
      <PageLayout title={t('threads.list.title')}>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error || !thread) {
    return (
      <PageLayout title={t('threads.list.title')}>
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {t(error ?? 'threads.detail.error')}
        </div>
      </PageLayout>
    );
  }

  const category = categoryMap.get(thread.categoryId);
  const threadMod = getModerationForUser(thread.authorId);
  const visibleMessages = thread.messages.filter((m) => !m.deleted);
  const deletedMessages = thread.messages.filter((m) => m.deleted);

  const threadModItems: ModMenuItem[] = [
    {
      label: thread.archived ? t('threads.moderation.unarchive') : t('threads.moderation.archive'),
      onClick: () => void (thread.archived ? handleUnarchiveThread() : handleArchiveThread()),
    },
    {
      label: t('threads.moderation.deleteThread'),
      onClick: () => void handleDeleteThread(),
      variant: 'destructive',
    },
    { divider: true },
    {
      label: threadMod?.muted ? t('threads.moderation.unmute') : t('threads.moderation.mute'),
      onClick: () => void handleToggleMute(thread.authorId, threadMod?.muted ?? false),
    },
    {
      label: threadMod?.banned ? t('threads.moderation.unban') : t('threads.moderation.ban'),
      onClick: () => void handleToggleBan(thread.authorId, threadMod?.banned ?? false),
      variant: 'destructive',
    },
  ];

  return (
    <PageLayout title={t('threads.list.title')}>
      <div className="mx-auto w-full max-w-3xl">
        {/* Archived banner */}
        {thread.archived && (
          <div className="mb-4 flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="flex-1 text-amber-800 text-sm dark:text-amber-200">{t('threads.detail.archivedSubject')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleUnarchiveThread()}
              className="shrink-0 gap-1.5"
            >
              <RotateCcw className="size-3" />
              {t('threads.detail.unarchive')}
            </Button>
          </div>
        )}

        {/* Original post */}
        {thread.deleted ? (
          <div className="mb-5 flex items-center gap-4 rounded-xl border border-border border-dashed bg-muted/30 p-5">
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-semibold text-muted-foreground text-xs">{t('threads.detail.deletedSubject')}</p>
              <p className="truncate text-muted-foreground text-sm italic line-through">{thread.title}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void handleRestoreThread()} className="shrink-0 gap-1.5">
              <RotateCcw className="size-3" />
              {t('threads.detail.restore')}
            </Button>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              {/* TODO: resolve display name via users API */}
              <ThreadAvatar initials={getInitials(thread.authorId)} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-muted-foreground text-xs">{thread.authorId}</span>
                  <UserStatusBadge muted={threadMod?.muted ?? false} banned={threadMod?.banned ?? false} />
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  {category && <CategoryBadge category={category} />}
                  <span className="text-muted-foreground text-xs">
                    {formatTime(thread.createdAt)} · {formatRelative(thread.createdAt)}
                  </span>
                </div>
              </div>
              <ModMenu items={threadModItems} />
            </div>
            <h2 className="mb-2 font-bold text-foreground text-xl">{thread.title}</h2>
            <p className="text-foreground text-sm leading-relaxed">{thread.body}</p>
          </div>
        )}

        {/* Replies */}
        <div className="mb-4">
          <h3 className="mb-3 font-semibold text-muted-foreground text-sm">
            {t('threads.detail.replies_one', {
              count: visibleMessages.length,
              defaultValue_other: t('threads.detail.replies_other', {
                count: visibleMessages.length,
              }),
            })}
          </h3>
          <div className="flex flex-col gap-2.5">
            {visibleMessages.map((msg) => {
              const msgMod = getModerationForUser(msg.authorId);
              return (
                <MessageRow
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                  muted={msgMod?.muted ?? false}
                  banned={msgMod?.banned ?? false}
                  onDelete={() => void handleDeleteMessage(msg.id)}
                  onToggleMute={() => void handleToggleMute(msg.authorId, msgMod?.muted ?? false)}
                  onToggleBan={() => void handleToggleBan(msg.authorId, msgMod?.banned ?? false)}
                  onToggleReaction={(emoji) => void handleToggleReaction(msg.id, emoji)}
                />
              );
            })}
            {visibleMessages.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">{t('threads.detail.noVisibleReplies')}</p>
            )}
          </div>
        </div>

        {/* Deleted messages */}
        {deletedMessages.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={toggleShowDeletedMessages}
              className="mb-3 flex w-full items-center gap-2 py-1 font-semibold text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              <Trash2 className="size-3.5 text-destructive" />
              {t('threads.detail.deletedMessages', { count: deletedMessages.length })}
              <ChevronDown
                className={`ml-1 size-3.5 transition-transform ${showDeletedMessages ? 'rotate-180' : ''}`}
              />
            </button>
            {showDeletedMessages && (
              <div className="flex flex-col gap-2">
                {deletedMessages.map((msg) => (
                  <DeletedMessageRow key={msg.id} message={msg} onRestore={() => void handleRestoreMessage(msg.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reply composer */}
        <div className="rounded-lg border border-border bg-card p-4">
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={t('threads.detail.replyPlaceholder')}
            rows={3}
            className="mb-3 resize-none border-0 p-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => void handleSubmitReply()} disabled={isReplying || !replyBody.trim()}>
              {t('threads.detail.replyButton')}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
