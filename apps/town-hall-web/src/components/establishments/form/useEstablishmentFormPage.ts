'use client';

import type { EstablishmentType } from '@repo/contracts/establishment';
import { CreateEstablishmentInput } from '@repo/contracts/establishment';
import { EstablishmentService } from '@repo/frontend-services/establishment';
import { UploadService } from '@repo/frontend-services/upload';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';

type FormState = {
  name: string;
  type: EstablishmentType;
  address: string;
  hours: string;
  phone: string;
  imageUrl: string;
};

const DEFAULT_FORM: FormState = {
  name: '',
  type: 'town_hall',
  address: '',
  hours: '',
  phone: '',
  imageUrl: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function useEstablishmentFormPage(id?: string) {
  const router = useRouter();
  const api = useApi();
  const establishmentService = new EstablishmentService(api);
  const uploadService = new UploadService(api);
  const isEditing = id !== undefined;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const establishment = await establishmentService.getById(id);
        setForm({
          name: establishment.name,
          type: establishment.type,
          address: establishment.address,
          hours: establishment.hours,
          phone: establishment.phone,
          imageUrl: establishment.imageUrl ?? '',
        });
      } catch {
        setApiError('Impossible de charger cet établissement.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [id, isEditing, establishmentService.getById]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setIsDirty(true);
  }, []);

  const validate = useCallback((): boolean => {
    const result = CreateEstablishmentInput.safeParse({ ...form, imageUrl: form.imageUrl || undefined });
    if (!result.success) {
      const newErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof FormState | undefined;
        if (path) {
          newErrors[path] = issue.message;
        }
      }
      setErrors(newErrors);
      return false;
    }
    return true;
  }, [form]);

  const handleUploadImage = useCallback((file: File) => uploadService.uploadImage(file), [uploadService.uploadImage]);

  const handleSubmit = useCallback(async () => {
    setApiError(null);
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...form, imageUrl: form.imageUrl || undefined };
      if (isEditing && id) {
        await establishmentService.update(id, payload);
      } else {
        await establishmentService.create(payload);
      }
      setIsDirty(false);
      router.push('/dashboard/establishment');
    } catch {
      setApiError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, id, isEditing, router, validate, establishmentService.create, establishmentService.update]);

  const navigateAway = useCallback(() => {
    router.push('/dashboard/establishment');
  }, [router]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      navigateAway();
    }
  }, [isDirty, navigateAway]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      navigateAway();
    }
  }, [isDirty, navigateAway]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    navigateAway();
  }, [navigateAway]);

  const closeDiscardDialog = useCallback(() => {
    setShowDiscardDialog(false);
  }, []);

  return {
    isEditing,
    form,
    errors,
    isLoading,
    isSubmitting,
    apiError,
    isDirty,
    showDiscardDialog,
    setField,
    handleUploadImage,
    handleSubmit,
    handleCancel,
    handleBack,
    confirmDiscard,
    closeDiscardDialog,
  };
}
