'use client';

import type { Establishment, EstablishmentType } from '@repo/contracts/establishment';
import { Clock, LayoutGrid, List, MapPin, MoreHorizontal, Phone, Plus } from 'lucide-react';
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
import type { useEstablishmentListPage } from './useEstablishmentListPage';

type Props = ReturnType<typeof useEstablishmentListPage>;

const TYPE_BADGE_VARIANTS: Record<EstablishmentType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  town_hall: 'destructive',
  education: 'default',
  culture: 'secondary',
  sport: 'outline',
};

function CardActions({ onEdit, onDeleteRequest }: Readonly<{ onEdit: () => void; onDeleteRequest: () => void }>) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" {...props}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        )}
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>{t('establishment.list.actions.edit')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive">
          {t('establishment.list.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EstablishmentRow({
  establishment,
  onEdit,
  onDeleteRequest,
}: Readonly<{
  establishment: Establishment;
  onEdit: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-background px-5 py-4 transition-colors hover:bg-muted/30">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{establishment.name}</h3>
          <Badge variant={TYPE_BADGE_VARIANTS[establishment.type]} className="text-xs">
            {t(`establishment.types.${establishment.type}`)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {establishment.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {establishment.hours}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {establishment.phone}
          </span>
        </div>
      </div>
      <CardActions onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
    </div>
  );
}

function EstablishmentTile({
  establishment,
  onEdit,
  onDeleteRequest,
}: Readonly<{
  establishment: Establishment;
  onEdit: () => void;
  onDeleteRequest: () => void;
}>) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background transition-colors hover:bg-muted/30">
      <div className="relative aspect-video w-full bg-muted">
        {establishment.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: l'app utilise <img> natif partout
          <img src={establishment.imageUrl} alt={establishment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            {t('establishment.list.noImage')}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <CardActions onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm">{establishment.name}</h3>
          <Badge variant={TYPE_BADGE_VARIANTS[establishment.type]} className="text-xs">
            {t(`establishment.types.${establishment.type}`)}
          </Badge>
        </div>
        <div className="space-y-1 text-muted-foreground text-xs">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {establishment.address}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            {establishment.hours}
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0" />
            {establishment.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

export function EstablishmentListPage(props: Props) {
  const {
    establishments,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    confirmDeleteId,
    setConfirmDeleteId,
    error,
    handleDelete,
    navigateToCreate,
    navigateToEdit,
  } = props;

  const { t } = useTranslation();

  return (
    <PageLayout title={t('establishment.list.title')}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t('establishment.list.count', { count: establishments.length })}
        </p>
        <Button onClick={navigateToCreate}>
          <Plus className="mr-2 size-4" />
          {t('establishment.list.add')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('establishment.types.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('establishment.types.all')}</SelectItem>
            <SelectItem value="town_hall">{t('establishment.types.town_hall')}</SelectItem>
            <SelectItem value="education">{t('establishment.types.education')}</SelectItem>
            <SelectItem value="culture">{t('establishment.types.culture')}</SelectItem>
            <SelectItem value="sport">{t('establishment.types.sport')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={t('establishment.list.searchPlaceholder')}
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
                {t('establishment.list.viewMode.list')}
              </span>
            </SelectItem>
            <SelectItem value="grid">
              <span className="flex items-center gap-2">
                <LayoutGrid className="size-4" />
                {t('establishment.list.viewMode.grid')}
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

      {/* Cards */}
      {establishments.length === 0 && (
        <div className="rounded-lg border px-4 py-10 text-center text-muted-foreground">
          <p className="font-medium">{t('establishment.list.empty.title')}</p>
          <Button variant="link" className="mt-1" onClick={navigateToCreate}>
            {t('establishment.list.empty.createFirst')}
          </Button>
        </div>
      )}

      {establishments.length > 0 && viewMode === 'list' && (
        <div className="flex flex-col gap-2.5">
          {establishments.map((establishment) => (
            <EstablishmentRow
              key={establishment.id}
              establishment={establishment}
              onEdit={() => navigateToEdit(establishment.id)}
              onDeleteRequest={() => setConfirmDeleteId(establishment.id)}
            />
          ))}
        </div>
      )}

      {establishments.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {establishments.map((establishment) => (
            <EstablishmentTile
              key={establishment.id}
              establishment={establishment}
              onEdit={() => navigateToEdit(establishment.id)}
              onDeleteRequest={() => setConfirmDeleteId(establishment.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('establishment.list.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('establishment.list.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('establishment.list.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('establishment.list.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
