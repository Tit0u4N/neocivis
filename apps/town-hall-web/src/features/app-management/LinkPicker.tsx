'use client';

import type { Article } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/providers/ApiProvider';

export type TileLinkType =
  | 'General'
  | 'Establishment'
  | 'ArticlePage'
  | 'Forum'
  | 'Reports'
  | 'Articles'
  | 'ExternalURL';

export type LinkGroupId = 'special' | 'normal' | 'external';

export const LINK_GROUPS: { groupId: LinkGroupId; options: TileLinkType[] }[] = [
  { groupId: 'special', options: ['General', 'Establishment', 'ArticlePage'] },
  { groupId: 'normal', options: ['Forum', 'Reports', 'Articles'] },
  { groupId: 'external', options: ['ExternalURL'] },
];

export type LinkValue = { type: string; value?: string };

const KNOWN_TYPES = new Set(LINK_GROUPS.flatMap((g) => g.options as string[]));

const DEFAULT_LINK: TileLinkType = 'General';

export function urlToLinkValue(url?: string): LinkValue {
  if (!url) {
    return { type: DEFAULT_LINK };
  }
  if (KNOWN_TYPES.has(url)) {
    return { type: url };
  }
  return { type: 'ExternalURL', value: url };
}

export function linkValueToUrl(link: LinkValue): string | undefined {
  if (link.type === 'ExternalURL' || link.type === 'ArticlePage') {
    return link.value;
  }
  if (link.type === DEFAULT_LINK) {
    return undefined;
  }
  return link.type;
}

type LinkPickerProps = {
  label?: string;
  value: LinkValue;
  onChange: (link: LinkValue) => void;
};

function getArticleTitle(article: Article): string {
  return article.translations.find((tr) => tr.locale === 'fr')?.title ?? article.id;
}

export function LinkPicker({ label, value, onChange }: Readonly<LinkPickerProps>) {
  const { t } = useTranslation();
  const api = useApi();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (value.type !== 'ArticlePage') {
      return;
    }
    const service = new ArticleService(api);
    service
      .getAll()
      .then(setArticles)
      .catch(() => {});
  }, [value.type, api]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="font-medium text-muted-foreground text-xs">{label}</Label>}
      <Select value={value.type} onValueChange={(v) => onChange({ type: v })}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {LINK_GROUPS.map((group) => (
            <SelectGroup key={group.groupId}>
              <SelectLabel>{t(`appManagement.linkGroups.${group.groupId}`)}</SelectLabel>
              {group.options.map((id) => (
                <SelectItem key={id} value={id}>
                  {t(`appManagement.links.${id}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {value.type === 'ArticlePage' && (
        <div className="flex flex-col gap-1">
          <Label className="font-medium text-muted-foreground text-xs">{t('appManagement.settings.article')}</Label>
          <Combobox
            value={value.value ?? null}
            onValueChange={(id) => onChange({ ...value, value: id ?? undefined })}
            itemToStringLabel={(articleId) => {
              if (!articleId) {
                return '';
              }
              const article = articles.find((a) => a.id === articleId);
              return article ? getArticleTitle(article) : articleId;
            }}
          >
            <ComboboxInput
              className="h-9"
              showClear={!!value.value}
              placeholder={t('appManagement.settings.articlePlaceholder')}
            />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxEmpty>{t('appManagement.settings.noArticles')}</ComboboxEmpty>
                {articles.map((article) => (
                  <ComboboxItem key={article.id} value={article.id}>
                    {getArticleTitle(article)}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      )}
      {value.type === 'ExternalURL' && (
        <div className="flex flex-col gap-1">
          <Label className="font-medium text-muted-foreground text-xs">{t('appManagement.settings.externalUrl')}</Label>
          <Input
            className="h-9 font-mono text-sm"
            value={value.value ?? ''}
            onChange={(e) => onChange({ ...value, value: e.target.value || undefined })}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}
