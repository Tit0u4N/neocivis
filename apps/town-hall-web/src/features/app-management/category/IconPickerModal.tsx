'use client';

import { Dialog } from '@base-ui/react/dialog';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Icons are React.forwardRef objects (not functions) — filter by PascalCase + no Icon suffix alias
const ALL_ICON_NAMES: string[] = Object.keys(LucideIcons).filter(
  (name) => /^[A-Z]/.test(name) && !name.endsWith('Icon') && name !== 'createLucideIcon',
);

const PAGE_SIZE = 120;

type IconPickerModalProps = {
  value: string;
  onChange: (icon: string) => void;
};

export function IconPickerModal({ value, onChange }: IconPickerModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ALL_ICON_NAMES.slice(0, PAGE_SIZE);
    }
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(0, PAGE_SIZE);
  }, [query]);

  const CurrentIcon =
    value && value !== 'none'
      ? ((LucideIcons as unknown as Record<string, unknown>)[value] as LucideIcon | undefined)
      : undefined;

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-medium text-muted-foreground text-xs">{t('appManagement.icon.label')}</Label>
      <Dialog.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setQuery('');
          }
        }}
      >
        <Dialog.Trigger className="flex w-full items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-5 shrink-0 items-center justify-center text-foreground">
            {CurrentIcon ? <CurrentIcon size={15} /> : <span className="text-muted-foreground">—</span>}
          </span>
          <span className="flex-1 truncate text-foreground">
            {value === 'none' || !value ? t('appManagement.icon.none') : value}
          </span>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50 duration-100 data-closed:animate-out data-open:animate-in" />
          <Dialog.Popup className="data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-lg rounded-xl bg-background shadow-xl outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Dialog.Title className="font-semibold text-sm">{t('appManagement.icon.modalTitle')}</Dialog.Title>
              <Dialog.Close className="flex size-7 items-center justify-center rounded-md hover:bg-muted">
                <X size={15} />
              </Dialog.Close>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('appManagement.icon.searchPlaceholder')}
                  className="pl-8"
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-muted-foreground text-xs">
                {query
                  ? t('appManagement.icon.searchResultCount', { count: filtered.length })
                  : t('appManagement.icon.allCount', { count: ALL_ICON_NAMES.length })}
              </p>
            </div>

            {/* Grid */}
            <div className="max-h-72 overflow-y-auto px-3 pb-3">
              <div className="grid grid-cols-9 gap-0.5">
                {/* None option */}
                <button
                  type="button"
                  title={t('appManagement.icon.noneTitle')}
                  onClick={() => select('none')}
                  className={cn(
                    'flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-muted',
                    (value === 'none' || !value) && 'bg-muted ring-1 ring-foreground/30',
                  )}
                >
                  <span className="text-muted-foreground text-sm leading-none">—</span>
                </button>

                {filtered.map((name) => {
                  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => select(name)}
                      className={cn(
                        'flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-muted',
                        value === name && 'bg-muted ring-1 ring-foreground/30',
                      )}
                    >
                      <Icon size={17} />
                    </button>
                  );
                })}
              </div>

              {query && filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground text-sm">
                  {t('appManagement.icon.noResults', { query })}
                </p>
              )}

              {!query && (
                <p className="mt-2 text-center text-muted-foreground text-xs">{t('appManagement.icon.searchHint')}</p>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
