'use client';

import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-teal-500',
];

function getColorClass(initials: string): string {
  const index = initials.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? 'bg-primary';
}

type Props = {
  initials: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function ThreadAvatar({ initials, size = 'md', className }: Props) {
  const colorClass = getColorClass(initials);
  const sizeClass = size === 'sm' ? 'size-7 text-xs' : 'size-9 text-sm';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        colorClass,
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}

/** Extract initials from a display name (e.g. "Marie DUPONT" → "MD") */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
