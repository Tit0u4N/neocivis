// @ts-nocheck

'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  ),
}));

vi.mock('@/features/threads/list/NewThreadModal', () => ({
  NewThreadModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-thread-modal">
      <button type="button" onClick={onClose}>
        Fermer
      </button>
    </div>
  ),
}));

vi.mock('@/features/threads/components/CategoryBadge', () => ({
  CategoryBadge: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock('@/features/threads/components/ThreadAvatar', () => ({
  ThreadAvatar: () => <div data-testid="thread-avatar" />,
  getInitials: (name: string) => name.slice(0, 2).toUpperCase(),
}));

import { ThreadListPage } from './ThreadListPage';

afterEach(cleanup);

function makeThread(id: string, title: string, authorId = 1) {
  return {
    id,
    title,
    authorId,
    categoryId: 'cat1',
    replyCount: 3,
    likeCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastReplyAt: '2024-01-02T00:00:00Z',
  };
}

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    categories: [],
    threads: [],
    activeCategoryId: null,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    currentPage: 1,
    error: null,
    showNewThreadModal: false,
    mutedCount: 0,
    bannedCount: 0,
    handleSelectCategory: vi.fn(),
    handleOpenNewThread: vi.fn(),
    handleCloseNewThread: vi.fn(),
    handleThreadCreated: vi.fn(),
    handleLoadMore: vi.fn(),
    navigateToThread: vi.fn(),
    resolveUser: vi.fn().mockReturnValue(undefined),
    ...overrides,
  };
}

describe('ThreadListPage', () => {
  it('renders the page title', () => {
    render(<ThreadListPage {...makeProps()} />);
    expect(screen.getByText('threads.list.title')).toBeTruthy();
  });

  it('shows empty state when there are no threads', () => {
    render(<ThreadListPage {...makeProps({ threads: [] })} />);
    expect(screen.getByText('threads.list.empty')).toBeTruthy();
  });

  it('renders a card for each thread', () => {
    const threads = [makeThread('t1', 'Premier fil'), makeThread('t2', 'Deuxième fil')];
    render(<ThreadListPage {...makeProps({ threads })} />);
    expect(screen.getByText('Premier fil')).toBeTruthy();
    expect(screen.getByText('Deuxième fil')).toBeTruthy();
  });

  it('calls handleOpenNewThread when new thread button is clicked', () => {
    const handleOpenNewThread = vi.fn();
    render(<ThreadListPage {...makeProps({ handleOpenNewThread })} />);
    fireEvent.click(screen.getByText('threads.list.newThread'));
    expect(handleOpenNewThread).toHaveBeenCalled();
  });

  it('shows the new thread modal when showNewThreadModal is true', () => {
    render(<ThreadListPage {...makeProps({ showNewThreadModal: true })} />);
    expect(screen.getByTestId('new-thread-modal')).toBeTruthy();
  });

  it('calls navigateToThread when a thread card is clicked', () => {
    const navigateToThread = vi.fn();
    const threads = [makeThread('t1', 'Mon fil')];
    render(<ThreadListPage {...makeProps({ threads, navigateToThread })} />);
    fireEvent.click(screen.getByText('Mon fil'));
    expect(navigateToThread).toHaveBeenCalledWith('t1');
  });

  it('shows load more button when hasMore is true', () => {
    render(<ThreadListPage {...makeProps({ hasMore: true })} />);
    expect(screen.getByText('threads.list.loadMore')).toBeTruthy();
  });

  it('calls handleLoadMore when load more is clicked', () => {
    const handleLoadMore = vi.fn();
    render(<ThreadListPage {...makeProps({ hasMore: true, handleLoadMore })} />);
    fireEvent.click(screen.getByText('threads.list.loadMore'));
    expect(handleLoadMore).toHaveBeenCalled();
  });
});
