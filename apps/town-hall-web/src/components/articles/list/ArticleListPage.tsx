'use client';

import type { Article } from '@repo/contracts/article';
import { LayoutGrid, List, MoreHorizontal, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArticlePreview } from '@/components/articles/preview/ArticlePreview';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { useArticleListPage } from './useArticleListPage';

type Props = ReturnType<typeof useArticleListPage>;

function ArticleRow({
  article,
  onSelect,
  onEdit,
  onTranslations,
  onToggleStatus,
  onDeleteRequest,
}: Readonly<{
  article: Article;
  onSelect: () => void;
  onEdit: () => void;
  onTranslations: () => void;
  onToggleStatus: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();
  // biome-ignore lint/nursery/noShadow:Let him cook
  const frTranslation = article.translations.find((t) => t.locale === 'fr');

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <p className="cursor-pointer font-medium text-sm hover:underline" onClick={onSelect}>
          {frTranslation?.title ?? '—'}
        </p>
        {frTranslation?.description && (
          <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">{frTranslation.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
          {article.status === 'published' ? t('articles.list.status.published') : t('articles.list.status.draft')}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">
        {new Date(article.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {article.translations.map((translation) => (
            <Badge key={translation.locale} variant="outline" className="text-xs uppercase">
              {translation.locale}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" {...props}>
                <MoreHorizontal className="size-4" />
                <span className="sr-only">{t('articles.list.actions.label')}</span>
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>Consulter</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>{t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={onTranslations}>
              {t('articles.list.actions.manageTranslations')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              {article.status === 'published'
                ? t('articles.list.actions.unpublish')
                : t('articles.list.actions.publish')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function ArticleCard({
  article,
  onSelect,
  onEdit,
  onTranslations,
  onToggleStatus,
  onDeleteRequest,
}: Readonly<{
  article: Article;
  onSelect: () => void;
  onEdit: () => void;
  onTranslations: () => void;
  onToggleStatus: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();
  // biome-ignore lint/nursery/noShadow:Let him cook
  const frTranslation = article.translations.find((t) => t.locale === 'fr');

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 overflow-hidden">
          <p className="cursor-pointer truncate font-medium text-sm hover:underline" onClick={onSelect}>
            {frTranslation?.title ?? '—'}
          </p>
          {frTranslation?.description && (
            <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">{frTranslation.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" {...props}>
                <MoreHorizontal className="size-4" />
                <span className="sr-only">{t('articles.list.actions.label')}</span>
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>Consulter</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>{t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={onTranslations}>
              {t('articles.list.actions.manageTranslations')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              {article.status === 'published'
                ? t('articles.list.actions.unpublish')
                : t('articles.list.actions.publish')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
          {article.status === 'published' ? t('articles.list.status.published') : t('articles.list.status.draft')}
        </Badge>
        <div className="flex gap-1">
          {article.translations.map((translation) => (
            <Badge key={translation.locale} variant="outline" className="text-xs uppercase">
              {translation.locale}
            </Badge>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </p>
    </div>
  );
}

export function ArticleListPage(props: Props) {
  const { t } = useTranslation();
  const {
    articles,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    handleToggleStatus,
    navigateToCreate,
    navigateToEdit,
    navigateToTranslations,
    selectedArticle,
    handleSelectArticle,
    handleClosePreview,
    preview,
    viewMode,
    setViewMode,
  } = props;

  if (selectedArticle) {
    return (
      <ArticlePreview
        key={selectedArticle.id}
        {...preview}
        onBack={handleClosePreview}
        onEdit={() => navigateToEdit(selectedArticle.id)}
      />
    );
  }

  return (
    <PageLayout title={t('articles.list.title')}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{t('articles.list.count', { count: articles.length })}</p>
        <Button onClick={navigateToCreate}>
          <Plus className="mr-2 size-4" />
          {t('articles.list.newArticle')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('articles.list.filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('articles.list.filters.allStatuses')}</SelectItem>
            <SelectItem value="published">{t('articles.list.filters.published')}</SelectItem>
            <SelectItem value="draft">{t('articles.list.filters.drafts')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={t('articles.list.filters.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <SelectTrigger className="ml-auto w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">
              <span className="flex items-center gap-2">
                <List className="size-4" />
                {t('articles.list.viewMode.list')}
              </span>
            </SelectItem>
            <SelectItem value="grid">
              <span className="flex items-center gap-2">
                <LayoutGrid className="size-4" />
                {t('articles.list.viewMode.grid')}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('articles.list.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('articles.list.table.status')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('articles.list.table.publishedAt')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('articles.list.table.updatedAt')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('articles.list.table.languages')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3" colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && articles.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                    <p className="font-medium">{t('articles.list.empty.title')}</p>
                    <Button variant="link" className="mt-1" onClick={navigateToCreate}>
                      {t('articles.list.empty.createFirst')}
                    </Button>
                  </td>
                </tr>
              )}

              {!isLoading &&
                articles.map((article) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    onSelect={() => handleSelectArticle(article)}
                    onEdit={() => navigateToEdit(article.id)}
                    onTranslations={() => navigateToTranslations(article.id)}
                    onToggleStatus={() => void handleToggleStatus(article)}
                    onDeleteRequest={() => setConfirmDeleteId(article.id)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <>
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="font-medium">{t('articles.list.empty.title')}</p>
              <Button variant="link" className="mt-1" onClick={navigateToCreate}>
                {t('articles.list.empty.createFirst')}
              </Button>
            </div>
          )}
          {!isLoading && articles.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSelect={() => handleSelectArticle(article)}
                  onEdit={() => navigateToEdit(article.id)}
                  onTranslations={() => navigateToTranslations(article.id)}
                  onToggleStatus={() => void handleToggleStatus(article)}
                  onDeleteRequest={() => setConfirmDeleteId(article.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('articles.list.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('articles.list.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
