'use client';

import { useTranslation } from 'react-i18next';
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

export type TileLinkType =
  | 'Link'
  | 'General'
  | 'Establishment'
  | 'FreePage'
  | 'Forum'
  | 'Reports'
  | 'Articles'
  | 'Events'
  | 'External URL';

export type LinkGroupId = 'special' | 'freePage' | 'normal' | 'external';

export const LINK_GROUPS: { groupId: LinkGroupId; options: TileLinkType[] }[] = [
  { groupId: 'special', options: ['Link', 'General', 'Establishment'] },
  { groupId: 'freePage', options: ['FreePage'] },
  { groupId: 'normal', options: ['Forum', 'Reports', 'Articles', 'Events'] },
  { groupId: 'external', options: ['External URL'] },
];

export type LinkValue = { type: string; id?: string };

const KNOWN_TYPES = LINK_GROUPS.flatMap((g) => g.options as string[]);

export function urlToLinkValue(url?: string): LinkValue {
  if (!url) {
    return { type: 'Link' };
  }
  if (KNOWN_TYPES.includes(url)) {
    return { type: url };
  }
  return { type: 'External URL', id: url };
}

export function linkValueToUrl(link: LinkValue): string | undefined {
  if (link.type === 'External URL' || link.type === 'FreePage') {
    return link.id;
  }
  if (link.type === 'Link') {
    return undefined;
  }
  return link.type;
}

type LinkPickerProps = {
  label?: string;
  value: LinkValue;
  onChange: (link: LinkValue) => void;
};

export function LinkPicker({ label, value, onChange }: LinkPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="font-medium text-muted-foreground text-xs">{label}</Label>}
      <Select value={value.type} onValueChange={(v) => onChange({ ...value, type: v })}>
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
      {(value.type === 'External URL' || value.type === 'FreePage') && (
        <div className="flex flex-col gap-1">
          <Label className="font-medium text-muted-foreground text-xs">
            {value.type === 'External URL'
              ? t('appManagement.settings.externalUrl')
              : t('appManagement.settings.pageId')}
          </Label>
          <Input
            className="h-9 font-mono text-sm"
            value={value.id ?? ''}
            onChange={(e) => onChange({ ...value, id: e.target.value || undefined })}
            placeholder={value.type === 'External URL' ? 'https://...' : 'page-id'}
          />
        </div>
      )}
    </div>
  );
}
