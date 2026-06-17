// @ts-nocheck

'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/back-button', () => ({
  BackButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      common.back
    </button>
  ),
}));

vi.mock('@/features/threads/components/CategoryBadge', () => ({
  CategoryBadge: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock('@/features/threads/components/ThreadAvatar', () => ({
  ThreadAvatar: () => <div data-testid="thread-avatar" />,
  getInitials: (name: string) => name.slice(0, 2).toUpperCase(),
}));

vi.mock('@/features/threads/components/ModMenu', () => ({
  ModMenu: () => <div data-testid="mod-menu" />,
}));

vi.mock('@/features/threads/components/EmojiPickerPopover', () => ({
  EmojiPickerPopover: () => <div data-testid="emoji-picker" />,
}));

vi.mock('@/features/threads/components/UserStatusBadge', () => ({
  UserStatusBadge: () => <span data-testid="status-badge" />,
}));

import { ThreadDetailPage } from './ThreadDetailPage';

afterEach(cleanup);

function makeThread(overrides: Record<string, unknown> = {}) {
  return {
    id: 't1',
    title: 'Mon fil de discussion',
    body: 'Contenu du fil',
    authorId: 1,
    categoryId: 'cat1',
    archived: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    messages: [],
    reactions: [],
    ...overrides,
  };
}

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    thread: makeThread(),
    categories: [],
    currentUserId: 'user1',
    isLoading: false,
    error: null,
    replyBody: '',
    setReplyBody: vi.fn(),
    isReplying: false,
    showDeletedMessages: false,
    getModerationForUser: vi.fn().mockReturnValue(null),
    resolveUser: vi.fn().mockReturnValue(undefined),
    handleDeleteMessage: vi.fn(),
    handleRestoreMessage: vi.fn(),
    handleDeleteThread: vi.fn(),
    handleRestoreThread: vi.fn(),
    handleArchiveThread: vi.fn(),
    handleUnarchiveThread: vi.fn(),
    handleToggleMute: vi.fn(),
    handleToggleBan: vi.fn(),
    handleToggleReaction: vi.fn(),
    handleSubmitReply: vi.fn(),
    toggleShowDeletedMessages: vi.fn(),
    handleBack: vi.fn(),
    ...overrides,
  };
}

describe('ThreadDetailPage', () => {
  it('renders the thread title', () => {
    render(<ThreadDetailPage {...makeProps()} />);
    expect(screen.getByText('Mon fil de discussion')).toBeTruthy();
  });

  it('renders the thread body', () => {
    render(<ThreadDetailPage {...makeProps()} />);
    expect(screen.getByText('Contenu du fil')).toBeTruthy();
  });

  it('shows loading skeleton while loading', () => {
    const { container } = render(<ThreadDetailPage {...makeProps({ isLoading: true, thread: null })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error message when error is set', () => {
    render(<ThreadDetailPage {...makeProps({ error: 'Erreur de chargement' })} />);
    expect(screen.getByText('Erreur de chargement')).toBeTruthy();
  });
});
