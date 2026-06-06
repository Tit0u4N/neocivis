'use client';

import type { ThreadCategory } from '@repo/contracts/thread';
import { Badge } from '@/components/ui/badge';

// Category badge colors cycle through a small palette keyed on label initial
const COLOR_CLASSES: Array<{ bg: string; text: string }> = [
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
];

function getCategoryColors(label: string): { bg: string; text: string } {
  const index = label.charCodeAt(0) % COLOR_CLASSES.length;
  return COLOR_CLASSES[index] ?? COLOR_CLASSES[0];
}

type Props = {
  category: Pick<ThreadCategory, 'label' | 'emoji'>;
};

export function CategoryBadge({ category }: Props) {
  const { bg, text } = getCategoryColors(category.label);
  return (
    <Badge className={`shrink-0 rounded-full border-0 px-2 py-0.5 font-semibold text-xs ${bg} ${text}`}>
      {category.emoji} {category.label}
    </Badge>
  );
}
