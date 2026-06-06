'use client';

import { MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ModMenuItem =
  | {
      label: string;
      onClick: () => void;
      variant?: 'default' | 'destructive';
    }
  | { divider: true };

type Props = {
  items: ModMenuItem[];
};

export function ModMenu({ items }: Props) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 shrink-0 p-0"
            aria-label={t('threads.moderation.menuLabel')}
            {...props}
          >
            <MoreVertical className="size-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="min-w-52">
        {items.map((item, i) => {
          if ('divider' in item) {
            return <DropdownMenuSeparator key={i} />;
          }
          return (
            <DropdownMenuItem
              key={i}
              onClick={item.onClick}
              className={item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
