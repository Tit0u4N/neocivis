'use client';

import type { Article } from '@repo/contracts/article';
import { MoreHorizontal, Plus } from 'lucide-react';
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
  onEdit,
  onTranslations,
  onToggleStatus,
  onDeleteRequest,
}: {
  article: Article;
  onEdit: () => void;
  onTranslations: () => void;
  onToggleStatus: () => void;
  onDeleteRequest: () => void;
}) {
  const frTranslation = article.translations.find((t) => t.locale === 'fr');

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <p className="font-medium text-sm">{frTranslation?.title ?? '—'}</p>
        {frTranslation?.description && (
          <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">{frTranslation.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
          {article.status === 'published' ? 'Publié' : 'Brouillon'}
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
          {article.translations.map((t) => (
            <Badge key={t.locale} variant="outline" className="text-xs uppercase">
              {t.locale}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onClick={onTranslations}>Gérer les traductions</DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              {article.status === 'published' ? 'Dépublier' : 'Publier'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function ArticleListPage(props: Props) {
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
  } = props;

  return (
    <PageLayout title="Articles">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{articles.length} article(s)</p>
        <Button onClick={navigateToCreate}>
          <Plus className="mr-2 size-4" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Rechercher…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Titre</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Publication</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Modification</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Langues</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <tr key={i} className="border-b">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && articles.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                  <p className="font-medium">Aucun article</p>
                  <Button variant="link" className="mt-1" onClick={navigateToCreate}>
                    Créer votre premier article
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading &&
              articles.map((article) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  onEdit={() => navigateToEdit(article.id)}
                  onTranslations={() => navigateToTranslations(article.id)}
                  onToggleStatus={() => void handleToggleStatus(article)}
                  onDeleteRequest={() => setConfirmDeleteId(article.id)}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;article et toutes ses traductions seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
