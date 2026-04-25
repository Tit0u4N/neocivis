'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

type Props = {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  alt?: string;
  error?: string;
};

export function ImageUpload({ value, onChange, onUpload, alt, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('Fichier trop volumineux. Maximum 5 Mo.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch {
      setUploadError("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const displayError = error ?? uploadError;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt ?? 'Image'} className="h-48 w-full object-cover" />
          <div className="absolute inset-0 flex items-start justify-end gap-2 p-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : 'Changer'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="size-7"
              onClick={() => onChange(null)}
              disabled={uploading}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            'flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary',
            uploading && 'pointer-events-none opacity-60',
          )}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span className="text-sm">{uploading ? 'Upload en cours…' : 'Cliquer pour choisir une image'}</span>
          <span className="text-xs opacity-60">JPG, PNG, WebP — max 5 Mo</span>
        </button>
      )}

      {displayError && <p className="text-destructive text-xs">{displayError}</p>}
    </div>
  );
}
