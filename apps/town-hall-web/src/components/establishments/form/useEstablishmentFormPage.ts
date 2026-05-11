'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { EstablishmentType } from '../list/useEstablishmentListPage';

type FormState = {
  name: string;
  type: EstablishmentType;
  address: string;
  hours: string;
  phone: string;
};

const DEFAULT_FORM: FormState = {
  name: '',
  type: 'mairie',
  address: '',
  hours: '',
  phone: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function useEstablishmentFormPage(id?: string) {
  const router = useRouter();
  const isEditing = id !== undefined;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Édition : on simule le chargement de l'établissement.
  // À remplacer par un appel au futur EstablishmentService quand le backend sera prêt.
  useEffect(() => {
    if (!isEditing) {
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setForm(DEFAULT_FORM);
      setIsLoading(false);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [isEditing]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setIsDirty(true);
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Le nom est requis.';
    }
    if (!form.address.trim()) {
      newErrors.address = "L'adresse est requise.";
    }
    if (!form.hours.trim()) {
      newErrors.hours = 'Les horaires sont requis.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    setApiError(null);
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // À remplacer par : await establishmentService.create(form) / update(id, form)
      await new Promise((resolve) => setTimeout(resolve, 200));
      setIsDirty(false);
      router.push('/dashboard/establishment');
    } catch {
      setApiError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  }, [router, validate]);

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
    handleSubmit,
    handleCancel,
    handleBack,
    confirmDiscard,
    closeDiscardDialog,
  };
}
