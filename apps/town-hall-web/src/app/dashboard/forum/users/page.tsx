'use client';

import { ForumUsersPage } from '@/components/forum-users/ForumUsersPage';
import { useForumUsersPage } from '@/components/forum-users/useForumUsersPage';

export default function ForumUsersDashboardPage() {
  const vm = useForumUsersPage();
  return <ForumUsersPage {...vm} />;
}
