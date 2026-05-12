'use client';

import { Loader2 } from 'lucide-react';
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
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { EstablishmentType } from '@repo/contracts/establishment';
import type { useEstablishmentFormPage } from './useEstablishmentFormPage';

type Props = ReturnType<typeof useEstablishmentFormPage>;

export function EstablishmentFormPage(props: Props) {
  const {
    isEditing,
    form,
    errors,
    isLoading,
    isSubmitting,
    apiError,
    showDiscardDialog,
    setField,
    handleUploadImage,
    handleSubmit,
    handleCancel,
    handleBack,
    confirmDiscard,
    closeDiscardDialog,
  } = props;

  const discardDialog = (
    <AlertDialog open={showDiscardDialog} onOpenChange={(open) => !open && closeDiscardDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandonner les modifications ?</AlertDialogTitle>
          <AlertDialogDescription>Les modifications non sauvegardées seront perdues.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDiscardDialog}>Continuer l'édition</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDiscard}>Abandonner</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <PageLayout title={isEditing ? "Modifier l'établissement" : 'Nouvel établissement'}>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? "Modifier l'établissement" : 'Nouvel établissement'}>
      {discardDialog}
      <div className="max-w-3xl space-y-6">
        <BackButton onClick={handleBack}>Retour</BackButton>

        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {apiError}
          </div>
        )}

        {/* Nom */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Ex : Mairie principale"
            aria-invalid={errors.name !== undefined}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setField('type', v as EstablishmentType)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mairie">Mairie</SelectItem>
              <SelectItem value="education">Éducation</SelectItem>
              <SelectItem value="culture">Culture</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adresse */}
        <div className="space-y-1.5">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder="Ex : 1 Place du Général de Gaulle"
            aria-invalid={errors.address !== undefined}
          />
          {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
        </div>

        {/* Horaires */}
        <div className="space-y-1.5">
          <Label htmlFor="hours">Horaires</Label>
          <Input
            id="hours"
            value={form.hours}
            onChange={(e) => setField('hours', e.target.value)}
            placeholder="Ex : Lun-Ven 8h-17h"
            aria-invalid={errors.hours !== undefined}
          />
          {errors.hours && <p className="text-destructive text-xs">{errors.hours}</p>}
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="Ex : 04 93 32 80 00"
            aria-invalid={errors.phone !== undefined}
          />
          {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
        </div>

        {/* Image */}
        <div className="space-y-1.5">
          <Label>Image</Label>
          <ImageUpload
            value={form.imageUrl || undefined}
            onChange={(url) => setField('imageUrl', url ?? '')}
            onUpload={handleUploadImage}
            alt={form.name || "Image de l'établissement"}
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
