'use client';

import { Button } from 'apps/town-hall-web/src/components/ui/button';
import { Label } from 'apps/town-hall-web/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'apps/town-hall-web/src/components/ui/select';
import { type Locale, useConfigStore } from 'apps/town-hall-web/src/stores/config.store';
import { Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type LocaleRow = { locale: string };

type LocaleManagerProps<T extends LocaleRow> = {
  title?: string;
  label?: string;
  rowLabel?: string;
  translations: T[];
  defaultLocale: Locale;
  onAdd: (locale: Locale) => void;
  onRemove: (locale: Locale) => void;
  renderRow: (translation: T) => ReactNode;
};

export function LocaleManager<T extends LocaleRow>({
  title,
  label,
  rowLabel,
  translations,
  defaultLocale,
  onAdd,
  onRemove,
  renderRow,
}: LocaleManagerProps<T>) {
  const { t } = useTranslation();
  const availableLocales = useConfigStore((s) => s.availableLocales);
  const missingLocales = availableLocales.filter((l) => !translations.some((tr) => tr.locale === l));

  return (
    <div className="flex flex-col gap-2">
      {title && <span className="font-semibold text-foreground text-sm">{title}</span>}
      {label && <Label className="font-medium text-muted-foreground text-xs">{label}</Label>}
      <div className="flex flex-col gap-1.5">
        {rowLabel && (
          <div className="flex items-center gap-2">
            <span className="w-7 shrink-0" />
            <span className="flex-1 font-medium text-muted-foreground text-xs">{rowLabel}</span>
            <span className="w-8 shrink-0" />
          </div>
        )}
        {translations.map((tr) => (
          <div key={tr.locale} className="flex items-start gap-2">
            <span className="mt-1.5 w-7 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
              {tr.locale}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">{renderRow(tr)}</div>
            <Button
              variant="ghost"
              size="sm"
              disabled={tr.locale === defaultLocale}
              onClick={() => onRemove(tr.locale as Locale)}
              className="mt-0.5 h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      {missingLocales.length > 0 && (
        <Select value="" onValueChange={(v) => onAdd(v as Locale)}>
          <SelectTrigger className="h-8 w-full text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Plus className="size-3.5" />
              <SelectValue placeholder={t('appManagement.settings.addTranslation')} />
            </div>
          </SelectTrigger>
          <SelectContent position="popper">
            {missingLocales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                <span className="font-mono">{locale}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
