'use client';

import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { MessageSquare, Plus, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/ui/page-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryBadge } from '@/features/threads/components/CategoryBadge';
import { getInitials, ThreadAvatar } from '@/features/threads/components/ThreadAvatar';
import { NewThreadModal } from './NewThreadModal';
import type { useThreadListPage } from './useThreadListPage';

type Props = ReturnType<typeof useThreadListPage>;

function CategoryFilterButton({
  active,
  onClick,
  children,
}: Readonly<{ active: boolean; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-semibold text-xs transition-colors ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function ThreadCard({
  thread,
  category,
  onClick,
}: Readonly<{ thread: ThreadSummary; category: ThreadCategory | undefined; onClick: () => void }>) {
  const { t } = useTranslation();
  // TODO: resolve display name via users API
  const initials = getInitials(thread.authorId);
  const relativeDate = formatRelative(thread.createdAt);

  return (
    // biome-ignore lint/a11y/useSemanticElements: C OK
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <ThreadAvatar initials={initials} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {/* TODO: resolve display name via users API */}
            <span className="font-mono text-muted-foreground text-xs">{thread.authorId}</span>
            {category && <CategoryBadge category={category} />}
            <span className="ml-auto shrink-0 text-muted-foreground text-xs">{relativeDate}</span>
          </div>
          <p className="mb-1 font-semibold text-foreground text-sm">{thread.title}</p>
          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">{thread.body}</p>
          <div className="mt-2.5 flex gap-4">
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <MessageSquare className="size-3" />
              {t('threads.card.replies_one', {
                count: thread.replyCount,
                defaultValue_other: t('threads.card.replies_other', { count: thread.replyCount }),
              })}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <ThumbsUp className="size-3" />
              {thread.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  if (days < 7) {
    return `${days}j`;
  }
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function ThreadListPage(props: Props) {
  const { t } = useTranslation();
  const {
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
  } = props;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <PageLayout title={t('threads.list.title')}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground text-lg">{t('threads.list.subtitle')}</span>
            {mutedCount > 0 && (
              <Badge className="rounded-full border-0 bg-yellow-100 text-yellow-700">
                {t('threads.list.mutedCount_one', {
                  count: mutedCount,
                  defaultValue_other: t('threads.list.mutedCount_other', { count: mutedCount }),
                })}
              </Badge>
            )}
            {bannedCount > 0 && (
              <Badge className="rounded-full border-0 bg-red-100 text-red-700">
                {t('threads.list.bannedCount_one', {
                  count: bannedCount,
                  defaultValue_other: t('threads.list.bannedCount_other', { count: bannedCount }),
                })}
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={handleOpenNewThread}>
          <Plus className="mr-2 size-4" />
          {t('threads.list.newThread')}
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <CategoryFilterButton active={activeCategoryId === undefined} onClick={() => handleSelectCategory(undefined)}>
          {t('threads.list.filterAll')}
        </CategoryFilterButton>
        {categories.map((cat) => (
          <CategoryFilterButton
            key={cat.id}
            active={activeCategoryId === cat.id}
            onClick={() => handleSelectCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </CategoryFilterButton>
        ))}
      </div>

      {/* Thread list */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-foreground text-sm">{t('threads.list.lastComments')}</h3>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {t(error)}
          </div>
        )}

        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}

        {!isLoading && threads.length === 0 && !error && (
          <p className="py-8 text-center text-muted-foreground text-sm">{t('threads.list.empty')}</p>
        )}

        {!isLoading &&
          threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              category={categoryMap.get(thread.categoryId)}
              onClick={() => navigateToThread(thread.id)}
            />
          ))}
      </div>

      <NewThreadModal
        open={showNewThreadModal}
        categories={categories}
        onClose={handleCloseNewThread}
        onCreated={handleThreadCreated}
      />
    </PageLayout>
  );
}
