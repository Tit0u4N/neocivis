'use client';

import { Loader2 } from 'lucide-react';
import { PlateEditor } from '@/components/plate-editor/PlateEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { useArticleFormPage } from './useArticleFormPage';

type Props = ReturnType<typeof useArticleFormPage>;

export function ArticleFormPage(props: Props) {
  const { isEditing, form, errors, isLoading, isSubmitting, apiError, setField, handleSubmit, handleCancel } = props;

  if (isLoading) {
    return (
      <PageLayout title={isEditing ? "Modifier l'article" : 'Nouvel article'}>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? "Modifier l'article" : 'Nouvel article'}>
      <div className="max-w-3xl space-y-6">
        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {apiError}
          </div>
        )}

        {/* Titre */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Titre de l'article"
            aria-invalid={errors.title !== undefined}
          />
          {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Résumé ou sous-titre"
            rows={3}
          />
        </div>

        {/* Image de couverture */}
        <div className="space-y-1.5">
          <Label htmlFor="coverImageUrl">Image de couverture (URL, optionnel)</Label>
          <Input
            id="coverImageUrl"
            type="url"
            value={form.coverImageUrl}
            onChange={(e) => setField('coverImageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {form.coverImageUrl && (
            <div className="mt-2 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverImageUrl} alt="Aperçu de la couverture" className="h-48 w-full object-cover" />
            </div>
          )}
        </div>

        {/* Statut */}
        <div className="space-y-1.5">
          <Label>Statut</Label>
          <Select value={form.status} onValueChange={(v) => setField('status', v as 'draft' | 'published')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contenu */}
        <div className="space-y-1.5">
          <Label>Contenu</Label>
          <PlateEditor
            value={form.content}
            onChange={(v) => setField('content', v)}
            placeholder="Commencez à rédiger votre article…"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t pt-4">
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enregistrer
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Annuler
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
