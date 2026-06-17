'use client';

import { use } from 'react';
import { ThreadDetailPage } from '../../../../features/threads/detail/ThreadDetailPage';
import { useThreadDetailPage } from '../../../../features/threads/detail/useThreadDetailPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ThreadDetailRoute({ params }: Props) {
  const { id } = use(params);
  const vm = useThreadDetailPage(id);
  return <ThreadDetailPage {...vm} />;
}
