'use client';

import type { ArticleLocale } from '@repo/contracts/article';
import {
  BarChart3,
  Battery,
  Building,
  Languages,
  MessageCircle,
  Monitor,
  Pencil,
  Signal,
  Smartphone,
  User,
  Wifi,
} from 'lucide-react';
import { PlateEditor } from '@/components/plate-editor/PlateEditor';
import { BackButton } from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { useArticlePreview } from './useArticlePreview';

const LOCALE_LABELS: Record<ArticleLocale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
};

type Props = ReturnType<typeof useArticlePreview> & {
  onBack: () => void;
  onEdit: () => void;
};

function WebView({
  title,
  description,
  coverImageUrl,
  content,
  status,
}: Readonly<{
  title: string;
  description: string;
  coverImageUrl: string;
  content: unknown[];
  status: string;
}>) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? 'Publié' : 'Brouillon'}
        </Badge>
      </div>

      {coverImageUrl && (
        // biome-ignore lint/performance/noImgElement: l'app utilise <img> natif partout
        <img src={coverImageUrl} alt={title} className="w-full rounded-lg object-cover" style={{ maxHeight: 220 }} />
      )}

      <div className="space-y-2">
        <h1 className="font-bold text-4xl leading-tight">{title || '—'}</h1>
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
      </div>

      <PlateEditor value={content} readOnly />
    </div>
  );
}

function MobileView({
  title,
  description,
  coverImageUrl,
  content,
}: Readonly<{
  title: string;
  description: string;
  coverImageUrl: string;
  content: unknown[];
}>) {
  return (
    <div className="flex justify-center">
      <div className="w-[390px]">
        <div className="overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-black shadow-2xl">
          {/* Status Bar */}
          <div className="flex h-7 items-center justify-between bg-black px-4 text-white text-xs">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="size-3.5" />
              <Wifi className="size-3.5" />
              <Battery className="size-3.5" />
            </div>
          </div>
          {/* Notch */}
          <div className="relative h-10 bg-black">
            <div className="-translate-x-1/2 absolute top-0 left-1/2 mx-auto h-10 w-40 rounded-b-2xl bg-black" />
          </div>
          {/* Screen */}
          <div className="overflow-y-auto bg-background p-4" style={{ height: 700 }}>
            <div className="space-y-3">
              {coverImageUrl && (
                // biome-ignore lint/performance/noImgElement: l'app utilise <img> natif partout
                <img
                  src={coverImageUrl}
                  alt={title}
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: 180 }}
                />
              )}
              <h2 className="text-left font-bold text-2xl leading-tight">{title || '—'}</h2>
              {description && <p className="text-left text-muted-foreground text-sm">{description}</p>}
              <PlateEditor value={content} readOnly />
            </div>
          </div>
          {/* Bottom Navigation */}
          <div className="flex h-16 items-center justify-around border-t bg-background px-2">
            <div className="flex flex-col items-center gap-1">
              <Building className="size-5" />
              <span className="text-muted-foreground text-xs">Ville</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BarChart3 className="size-5" />
              <span className="text-muted-foreground text-xs">Rapport</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="size-5" />
              <span className="text-muted-foreground text-xs">Forum</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <User className="size-5" />
              <span className="text-muted-foreground text-xs">Compte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticlePreview({
  title,
  description,
  coverImageUrl,
  content,
  status,
  viewMode,
  setViewMode,
  locale,
  setLocale,
  availableLocales,
  onBack,
  onEdit,
}: Props) {
  const webContent = JSON.parse(JSON.stringify(content)) as unknown[];
  const mobileContent = JSON.parse(JSON.stringify(content)) as unknown[];

  return (
    <PageLayout title={title || '—'}>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <BackButton onClick={onBack}>Retour</BackButton>
        <div className="flex items-center gap-2">
          <Select value={locale} onValueChange={(v) => setLocale(v as ArticleLocale)}>
            <SelectTrigger className="!h-8 !px-2.5 !py-0 w-44">
              <Languages className="mr-2 size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLocales.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {LOCALE_LABELS[loc]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onEdit}>
            <Pencil className="mr-2 size-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Toggle vue */}
      <div className="flex border-border border-b">
        <button
          type="button"
          onClick={() => setViewMode('web')}
          className={cn(
            '-mb-px border-b-2 px-5 py-2 font-medium text-sm transition-colors',
            viewMode === 'web' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="flex items-center gap-2">
            <Monitor className="size-4" />
            Vue web
          </span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('mobile')}
          className={cn(
            '-mb-px border-b-2 px-5 py-2 font-medium text-sm transition-colors',
            viewMode === 'mobile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="flex items-center gap-2">
            <Smartphone className="size-4" />
            Vue mobile
          </span>
        </button>
      </div>

      {/* Contenu */}
      <div className="mt-4">
        {viewMode === 'web' ? (
          <WebView
            title={title}
            description={description}
            coverImageUrl={coverImageUrl}
            content={webContent}
            status={status}
          />
        ) : (
          <MobileView title={title} description={description} coverImageUrl={coverImageUrl} content={mobileContent} />
        )}
      </div>
    </PageLayout>
  );
}
