'use client';

import type { MediaImage } from '@repo/contracts/media';
import { Check, ChevronDown, Filter, ImageOff, Info, Search, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type MediaFilter, useMediaGallery } from './useMediaGallery';

type MediaGalleryProps = {
  mode: 'gallery' | 'picker';
  selectedMediaId?: string;
  onSelect?: (media: MediaImage) => void;
  onClose?: () => void;
};

export function MediaGallery({ mode, selectedMediaId, onSelect, onClose }: MediaGalleryProps) {
  const { t } = useTranslation();
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
        <div className="flex items-center justify-between border-border border-b px-6 py-4.5">
          <div>
            <h2 className="font-bold text-foreground text-lg">{t('media.gallery.title')}</h2>
            <p className="mt-0.5 text-muted-foreground text-xs">{t('media.gallery.subtitle')}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('media.gallery.close')}
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
            placeholder={t('media.gallery.searchPlaceholder')}
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
            className="h-7 min-w-48 cursor-pointer appearance-none rounded-[--radius] border border-border bg-background py-0 pr-7 pl-7 text-foreground text-sm outline-none focus:border-foreground"
          >
            {vm.filterOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-2.5 size-3 text-muted-foreground" />
        </div>

        <Button variant="outline" size="sm" onClick={vm.openUploadModal} disabled={vm.isUploading} className="gap-1.5">
          <Upload className="size-3" />
          {vm.isUploading ? t('media.gallery.uploading') : t('media.gallery.upload')}
        </Button>
      </div>

      {/* Count */}
      {!vm.isLoading && (
        <div className="px-6 pt-2.5 text-[11px] text-muted-foreground">
          {t('media.gallery.count', { filtered: vm.filteredMedia.length, total: vm.mediaList.length })}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pt-3.5 pb-6">
        {vm.isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-16/10 w-full rounded-none" />
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
            <p className="text-sm">{t('media.gallery.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
            {vm.filteredMedia.map((m) => (
              <MediaCard
                key={m.id}
                media={m}
                isSelected={m.id === selectedMediaId}
                onClick={() => vm.selectMedia(m)}
                linkTypeLabels={vm.linkTypeLabels}
                onDelete={mode === 'gallery' ? () => vm.openDeleteDialog(m) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        target={vm.deleteTarget}
        linkTypeLabels={vm.linkTypeLabels}
        onClose={vm.closeDeleteDialog}
        onConfirm={vm.confirmDelete}
      />

      {vm.isUploadModalOpen && (
        <UploadModal
          pendingFile={vm.pendingFile}
          uploadTitle={vm.uploadTitle}
          setPendingFile={vm.setPendingFile}
          setUploadTitle={vm.setUploadTitle}
          onClose={vm.closeUploadModal}
          onConfirm={vm.confirmUpload}
        />
      )}
    </div>
  );

  if (mode === 'picker') {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: For the picker
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-8" onClick={onClose}>
        {inner}
      </div>
    );
  }

  return inner;
}

type UploadModalProps = {
  pendingFile: File | null;
  uploadTitle: string;
  setPendingFile: (f: File | null) => void;
  setUploadTitle: (t: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function UploadModal({
  pendingFile,
  uploadTitle,
  setPendingFile,
  setUploadTitle,
  onClose,
  onConfirm,
}: UploadModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : null;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        setPendingFile(file);
      }
    },
    [setPendingFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPendingFile(file);
      }
    },
    [setPendingFile],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: overlay dismiss
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8" onClick={onClose}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: modal */}
      <div
        className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-foreground text-lg">{t('media.upload.title')}</h2>
            <p className="mt-0.5 text-muted-foreground text-xs">{t('media.upload.subtitle')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-7 rounded-lg text-foreground/60">
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Drop zone */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors',
            isDragging ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/40 hover:bg-muted/50',
            previewUrl ? 'p-2' : 'py-10',
          )}
        >
          {previewUrl ? (
            <div className="relative w-full">
              <img
                src={previewUrl}
                alt={t('media.upload.previewAlt')}
                className="max-h-48 w-full rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingFile(null);
                }}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Upload className="size-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">{t('media.upload.dropTitle')}</p>
                <p className="mt-0.5 text-muted-foreground text-xs">{t('media.upload.dropSubtitle')}</p>
              </div>
            </>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="upload-title" className="font-medium text-foreground text-sm">
            {t('media.upload.titleLabel')}{' '}
            <span className="font-normal text-muted-foreground">{t('media.upload.titleOptional')}</span>
          </label>
          <Input
            id="upload-title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder={t('media.upload.titlePlaceholder')}
          />
          <div className="flex items-start gap-1.5 rounded-lg bg-muted/60 px-3 py-2">
            <Info className="mt-px size-3 shrink-0 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{t('media.upload.titleHint')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('media.upload.cancel')}
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={!pendingFile} className="gap-1.5">
            <Upload className="size-3" />
            {t('media.upload.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}

type DeleteConfirmDialogProps = {
  target: MediaImage | null;
  linkTypeLabels: Record<string, string>;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteConfirmDialog({ target, linkTypeLabels, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const displayName = target?.title ?? target?.storagePath.split('/').pop() ?? '';

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('media.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('media.delete.description', { name: displayName })}</AlertDialogDescription>
        </AlertDialogHeader>
        {target && target.links.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="font-medium text-foreground text-xs">
              {t('media.delete.usedAt', { count: target.links.length })}
            </p>
            <ul className="flex flex-col gap-1">
              {target.links.map((l) => (
                <li key={l.idLink} className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                  <span className="rounded border border-border bg-background px-1.5 py-0.5 font-medium text-[10px] text-foreground/60">
                    {linkTypeLabels[l.type]}
                  </span>
                  <span className="truncate text-foreground/80">{l.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">{t('media.delete.notUsed')}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('media.delete.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('media.delete.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type MediaCardProps = {
  media: MediaImage;
  isSelected: boolean;
  onClick: () => void;
  linkTypeLabels: Record<string, string>;
  onDelete?: () => void;
};

function MediaCard({ media, isSelected, onClick, linkTypeLabels, onDelete }: MediaCardProps) {
  const { t } = useTranslation();
  const displayName = media.title ?? media.storagePath.split('/').pop() ?? '';
  const date = new Date(media.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: its a card
    <div
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
            {t('media.gallery.unusedBadge')}
          </span>
        ) : (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-semibold text-[10px] text-emerald-700">
            {t('media.gallery.usages', { count: media.links.length })}
          </span>
        )}

        {isSelected && (
          <span className="absolute top-2 right-2 flex size-5.5 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={t('media.gallery.deleteAria')}
            className="absolute top-2 right-2 flex size-5.5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
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
                {linkTypeLabels[l.type]} · {l.title}
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
    </div>
  );
}
