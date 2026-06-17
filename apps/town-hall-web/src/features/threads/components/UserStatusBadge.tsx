'use client';

import { useTranslation } from 'react-i18next';

type Props = {
  muted: boolean;
  banned: boolean;
};

export function UserStatusBadge({ muted, banned }: Props) {
  const { t } = useTranslation();

  if (banned) {
    return (
      <span className="rounded-full bg-red-100 px-1.5 py-0.5 font-bold text-[10px] text-red-700 uppercase tracking-wide">
        {t('threads.moderation.statusBanned')}
      </span>
    );
  }
  if (muted) {
    return (
      <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 font-bold text-[10px] text-yellow-700 uppercase tracking-wide">
        {t('threads.moderation.statusMuted')}
      </span>
    );
  }
  return null;
}
