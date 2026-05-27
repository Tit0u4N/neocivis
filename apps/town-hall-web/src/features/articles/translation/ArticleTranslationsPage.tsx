'use client';

import type { ArticleLocale } from '@repo/contracts/article';
import { PlateEditor } from 'apps/town-hall-web/src/components/plate-editor/PlateEditor';
import { BackButton } from 'apps/town-hall-web/src/components/ui/back-button';
import { Badge } from 'apps/town-hall-web/src/components/ui/badge';
import { Button } from 'apps/town-hall-web/src/components/ui/button';
import { Input } from 'apps/town-hall-web/src/components/ui/input';
import { Label } from 'apps/town-hall-web/src/components/ui/label';
import { PageLayout } from 'apps/town-hall-web/src/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'apps/town-hall-web/src/components/ui/select';
import { Skeleton } from 'apps/town-hall-web/src/components/ui/skeleton';
import { Textarea } from 'apps/town-hall-web/src/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from 'apps/town-hall-web/src/components/ui/tooltip';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { useArticleTranslationsPage } from './useArticleTranslationsPage';

type Props = ReturnType<typeof useArticleTranslationsPage>;

const LOCALE_LABELS: Record<ArticleLocale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
};

export function ArticleTranslationsPage(props: Props) {
  const { t } = useTranslation();
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

  const frTitle = article?.translations.find((translation) => translation.locale === 'fr')?.title ?? 'Article';

  return (
    <PageLayout title={t('articles.translations.pageTitle', { articleTitle: frTitle })}>
      <div className="max-w-3xl space-y-6">
        <BackButton onClick={navigateToEdit}>{t('articles.translations.backToEdit')}</BackButton>

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
                          {t('articles.translations.defaultLanguage')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(translation.locale as ArticleLocale)}
                      >
                        {t('common.edit')}
                      </Button>
                      {translation.locale === 'fr' ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={() => (
                              <span>
                                <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                                  <Trash2 className="size-4" />
                                </Button>
                              </span>
                            )}
                          />
                          <TooltipContent>{t('articles.translations.cannotDeleteFr')}</TooltipContent>
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
                        <Label>{t('articles.translations.fields.title')}</Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder={t('articles.translations.fields.titlePlaceholder')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('articles.translations.fields.description')}</Label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('articles.translations.fields.content')}</Label>
                        <PlateEditor
                          value={editForm.content as unknown[] | undefined}
                          onChange={(v) => setEditForm({ ...editForm, content: v })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => void handleSaveEdit()} disabled={isSavingEdit}>
                          {isSavingEdit && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                          {t('common.save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingLocale(null)}
                          disabled={isSavingEdit}
                        >
                          {t('common.cancel')}
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
                {t('articles.translations.addTranslation')}
              </Button>
            )}

            {isAddDialogOpen && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">{t('articles.translations.newTranslation')}</h3>

                <div className="space-y-1.5">
                  <Label>{t('articles.translations.fields.language')}</Label>
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
                  <Label>{t('articles.translations.fields.title')}</Label>
                  <Input
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder={t('articles.translations.fields.titlePlaceholder')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('articles.translations.fields.description')}</Label>
                  <Textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('articles.translations.fields.content')}</Label>
                  <PlateEditor
                    value={addForm.content as unknown[] | undefined}
                    onChange={(v) => setAddForm({ ...addForm, content: v })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => void handleAddTranslation()} disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                    {t('articles.translations.addTranslation')}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} disabled={isAdding}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}

            {availableLocalesToAdd.length === 0 && (
              <p className="text-muted-foreground text-sm">{t('articles.translations.allLanguagesAdded')}</p>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
