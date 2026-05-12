'use client';

import type { MediaImage } from '@repo/contracts/media';
import { Check, ChevronDown, Filter, ImageOff, Search, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MEDIA_LINK_TYPE_LABELS, type MediaFilter, useMediaGallery } from './useMediaGallery';

type MediaGalleryProps = {
  mode: 'gallery' | 'picker';
  selectedMediaId?: string;
  onSelect?: (media: MediaImage) => void;
  onClose?: () => void;
};

export function MediaGallery({ mode, selectedMediaId, onSelect, onClose }: MediaGalleryProps) {
  const vm = useMediaGallery({ onSelect });

  const inner = (
    // biome-ignore lint/a11y/noStaticElementInteractions: Same
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-background',
        mode === 'picker' ? 'max-h-[88vh] w-[min(1040px,100%)] rounded-2xl border border-border shadow-2xl' : 'h-full',
      )}
      onClick={mode === 'picker' ? (e) => e.stopPropagation() : undefined}
    >
      {mode === 'picker' && (
        <div className="flex items-center justify-between border-border border-b px-6 py-[18px]">
          <div>
            <h2 className="font-bold text-foreground text-lg">Galerie médias</h2>
            <p className="mt-0.5 text-muted-foreground text-xs">Choisissez une image ou téléchargez-en une nouvelle.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fermer"
            className="size-8 rounded-lg text-foreground/60"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-border/50 border-b px-6 py-3.5">
        <div className="relative min-w-60 flex-1">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-3.5 text-muted-foreground" />
          <Input
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            placeholder="Rechercher par titre ou utilisation…"
            className="pl-9 text-sm"
          />
          {vm.search && (
            <button
              type="button"
              onClick={() => vm.setSearch('')}
              className="-translate-y-1/2 absolute top-1/2 right-2.5 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-3 text-muted-foreground" />
          <select
            value={vm.activeFilter}
            onChange={(e) => vm.setActiveFilter(e.target.value as MediaFilter)}
            className="min-w-48 cursor-pointer appearance-none rounded-[--radius] border border-border bg-background py-2 pr-7 pl-7 text-foreground text-sm outline-none focus:border-foreground"
          >
            {vm.filterOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-2.5 size-3 text-muted-foreground" />
        </div>

        <Button variant="outline" size="sm" onClick={vm.triggerUpload} disabled={vm.isUploading} className="gap-1.5">
          <Upload className="size-3" />
          {vm.isUploading ? 'Upload en cours…' : 'Télécharger'}
        </Button>
      </div>

      {/* Count */}
      {!vm.isLoading && (
        <div className="px-6 pt-2.5 text-[11px] text-muted-foreground">
          {vm.filteredMedia.length} sur {vm.mediaList.length} image{vm.mediaList.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pt-3.5 pb-6">
        {vm.isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="flex flex-col gap-1.5 p-3">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : vm.filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageOff className="mb-3 size-8 opacity-40" />
            <p className="text-sm">Aucune image ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
            {vm.filteredMedia.map((m) => (
              <MediaCard key={m.id} media={m} isSelected={m.id === selectedMediaId} onClick={() => vm.selectMedia(m)} />
            ))}
          </div>
        )}
      </div>

      {vm.uploadError && <p className="px-6 pb-3 text-destructive text-xs">{vm.uploadError}</p>}

      <input
        ref={vm.fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => vm.handleFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );

  if (mode === 'picker') {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: For the picker
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8" onClick={onClose}>
        {inner}
      </div>
    );
  }

  return inner;
}

type MediaCardProps = {
  media: MediaImage;
  isSelected: boolean;
  onClick: () => void;
};

function MediaCard({ media, isSelected, onClick }: MediaCardProps) {
  const displayName = media.title ?? media.storagePath.split('/').pop() ?? '';
  const date = new Date(media.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group hover:-translate-y-px flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all hover:shadow-md',
        isSelected ? 'border-2 border-foreground' : 'border-border bg-background',
      )}
    >
      <div className="relative aspect-[16/10] bg-muted">
        <img src={media.url} alt={displayName} className="size-full object-cover" loading="lazy" />

        {media.links.length === 0 ? (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-semibold text-[10px] text-muted-foreground">
            Non utilisé
          </span>
        ) : (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-semibold text-[10px] text-emerald-700">
            {media.links.length} utilisation{media.links.length > 1 ? 's' : ''}
          </span>
        )}

        {isSelected && (
          <span className="absolute top-2 right-2 flex size-[22px] items-center justify-center rounded-full bg-foreground text-background">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate font-semibold text-[13px] text-foreground">{displayName}</p>
        <p className="text-[10px] text-muted-foreground">{date}</p>

        {media.links.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {media.links.slice(0, 2).map((l) => (
              <span
                key={l.idLink}
                className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-foreground/60"
              >
                {MEDIA_LINK_TYPE_LABELS[l.type]} · {l.title}
              </span>
            ))}
            {media.links.length > 2 && (
              <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-foreground/60">
                +{media.links.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
