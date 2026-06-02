'use client';

import { ThreadListPage } from '../../../features/threads/list/ThreadListPage';
import { useThreadListPage } from '../../../features/threads/list/useThreadListPage';

export default function ThreadsPage() {
  const vm = useThreadListPage();
  return <ThreadListPage {...vm} />;
}
