/** biome-ignore-all lint/style/useNamingConvention: Spec */
'use client';

import { EmojiPicker } from 'frimousse';
import { SmilePlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Props = {
  onSelect: (emoji: string) => void;
  /** Extra className on the trigger button */
  triggerClassName?: string;
};

export function EmojiPickerPopover({ onSelect, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            variant="ghost"
            size="sm"
            className={`h-7 w-7 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground ${triggerClassName ?? ''}`}
            aria-label={t('threads.detail.addReaction')}
          >
            <SmilePlus className="size-4" />
          </Button>
        )}
      />
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <EmojiPicker.Root
          locale="fr"
          columns={9}
          onEmojiSelect={({ emoji }) => {
            onSelect(emoji);
            setOpen(false);
          }}
          className="flex h-[300px] w-[300px] flex-col overflow-hidden"
        >
          <EmojiPicker.Search
            className="m-2 h-8 shrink-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            placeholder={t('threads.emojiPicker.searchPlaceholder')}
          />
          <EmojiPicker.Viewport className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              {t('threads.emojiPicker.loading')}
            </EmojiPicker.Loading>
            <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              {t('threads.emojiPicker.empty')}
            </EmojiPicker.Empty>
            <EmojiPicker.List
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div
                    {...props}
                    className="sticky top-0 z-10 bg-popover pt-2 pb-1 font-medium text-muted-foreground text-xs"
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ ...props }) => <div {...props} className="flex" />,
                Emoji: ({ emoji, ...props }) => (
                  <button
                    {...props}
                    type="button"
                    className={`flex size-8 items-center justify-center rounded text-xl transition-colors hover:bg-muted ${
                      emoji.isActive ? 'bg-muted' : ''
                    }`}
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </EmojiPicker.Viewport>
        </EmojiPicker.Root>
      </PopoverContent>
    </Popover>
  );
}
