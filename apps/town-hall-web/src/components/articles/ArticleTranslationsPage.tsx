'use client';

import type { ArticleLocale } from '@repo/contracts/article';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { PlateEditor } from '@/components/plate-editor/PlateEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { useArticleTranslationsPage } from './useArticleTranslationsPage';

type Props = ReturnType<typeof useArticleTranslationsPage>;

const LOCALE_LABELS: Record<ArticleLocale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
};

export function ArticleTranslationsPage(props: Props) {
  const {
    article,
    isLoading,
    error,
    availableLocalesToAdd,
    addLocale,
    setAddLocale,
    addForm,
    setAddForm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAdding,
    handleOpenAddDialog,
    handleAddTranslation,
    editingLocale,
    setEditingLocale,
    editForm,
    setEditForm,
    isSavingEdit,
    handleOpenEdit,
    handleSaveEdit,
    deletingLocale,
    handleDeleteTranslation,
    navigateToEdit,
  } = props;

  const frTitle = article?.translations.find((t) => t.locale === 'fr')?.title ?? 'Article';

  return (
    <PageLayout title={`Traductions — ${frTitle}`}>
      <div className="max-w-3xl space-y-6">
        {/* Back link */}
        <Button variant="ghost" size="sm" onClick={navigateToEdit} className="-ml-2">
          <ArrowLeft className="mr-1.5 size-4" />
          Retour à l&apos;édition
        </Button>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!isLoading && article && (
          <>
            {/* Existing translations */}
            <div className="space-y-3">
              {article.translations.map((translation) => (
                <div key={translation.locale} className="overflow-hidden rounded-lg border">
                  {/* Translation header */}
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs uppercase">
                        {translation.locale}
                      </Badge>
                      <span className="font-medium text-sm">{LOCALE_LABELS[translation.locale as ArticleLocale]}</span>
                      {translation.locale === 'fr' && (
                        <Badge variant="secondary" className="text-xs">
                          Langue par défaut
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(translation.locale as ArticleLocale)}
                      >
                        Modifier
                      </Button>
                      {translation.locale === 'fr' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                                <Trash2 className="size-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>La traduction française ne peut pas être supprimée</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDeleteTranslation(translation.locale as ArticleLocale)}
                          disabled={deletingLocale === translation.locale}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingLocale === translation.locale ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Translation preview */}
                  <div className="px-4 py-3">
                    <p className="font-medium text-sm">{translation.title}</p>
                    {translation.description && (
                      <p className="mt-0.5 text-muted-foreground text-xs">{translation.description}</p>
                    )}
                  </div>

                  {/* Inline edit form */}
                  {editingLocale === translation.locale && (
                    <div className="space-y-4 border-t bg-muted/10 px-4 py-4">
                      <div className="space-y-1.5">
                        <Label>Titre *</Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="Titre"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description (optionnel)</Label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Contenu</Label>
                        <PlateEditor
                          value={editForm.content}
                          onChange={(v) => setEditForm({ ...editForm, content: v })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => void handleSaveEdit()} disabled={isSavingEdit}>
                          {isSavingEdit && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                          Enregistrer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingLocale(null)}
                          disabled={isSavingEdit}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add translation */}
            {availableLocalesToAdd.length > 0 && !isAddDialogOpen && (
              <Button variant="outline" onClick={handleOpenAddDialog}>
                <Plus className="mr-2 size-4" />
                Ajouter une traduction
              </Button>
            )}

            {isAddDialogOpen && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Nouvelle traduction</h3>

                <div className="space-y-1.5">
                  <Label>Langue</Label>
                  <Select value={addLocale} onValueChange={(v) => setAddLocale(v as ArticleLocale)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocalesToAdd.map((locale) => (
                        <SelectItem key={locale} value={locale}>
                          {LOCALE_LABELS[locale]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Titre *</Label>
                  <Input
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="Titre dans cette langue"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Contenu</Label>
                  <PlateEditor value={addForm.content} onChange={(v) => setAddForm({ ...addForm, content: v })} />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => void handleAddTranslation()} disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                    Ajouter
                  </Button>
                  <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} disabled={isAdding}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {availableLocalesToAdd.length === 0 && (
              <p className="text-muted-foreground text-sm">Toutes les langues disponibles ont déjà été ajoutées.</p>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
