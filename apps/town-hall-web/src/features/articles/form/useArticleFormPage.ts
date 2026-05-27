'use client';

import type { ArticleStatus } from '@repo/contracts/article';
import { CreateArticleInput } from '@repo/contracts/article';
import type { MediaImage } from '@repo/contracts/media';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';

type FormState = {
  title: string;
  description: string;
  content: unknown;
  coverImageUrl: string;
  status: ArticleStatus;
};

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  content: [],
  coverImageUrl: '',
  status: 'draft',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function useArticleFormPage(id?: string) {
  const router = useRouter();
  const { articleService } = useServices();
  const isEditing = id !== undefined;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const article = await articleService.getById(id);
        const frTranslation = article.translations.find((t) => t.locale === 'fr');
        setForm({
          title: frTranslation?.title ?? '',
          description: frTranslation?.description ?? '',
          content: (frTranslation?.content as unknown as unknown[]) ?? [],
          coverImageUrl: article.coverImageUrl ?? '',
          status: article.status,
        });
      } catch {
        setApiError('Impossible de charger cet article.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [id, isEditing, articleService.getById]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setIsDirty(true);
  }, []);

  const validate = useCallback((): boolean => {
    const result = CreateArticleInput.safeParse({
      translation: {
        locale: 'fr',
        title: form.title,
        description: form.description || undefined,
        content: form.content,
      },
      coverImageUrl: form.coverImageUrl || undefined,
      status: form.status,
    });

    if (!result.success) {
      const newErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[1] as keyof FormState | undefined;
        if (path) {
          newErrors[path] = issue.message;
        }
      }
      setErrors(newErrors);
      return false;
    }
    return true;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    setApiError(null);
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        translation: {
          locale: 'fr' as const,
          title: form.title,
          description: form.description || undefined,
          content: form.content as unknown[],
        },
        coverImageUrl: form.coverImageUrl || undefined,
        status: form.status,
      };

      if (isEditing && id) {
        await articleService.update(id, payload);
      } else {
        await articleService.create(payload);
      }
      setIsDirty(false);
      router.push('/dashboard/articles');
    } catch {
      setApiError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, id, isEditing, router, validate, articleService.create, articleService.update]);

  const openImagePicker = useCallback(() => setIsPickerOpen(true), []);
  const closeImagePicker = useCallback(() => setIsPickerOpen(false), []);
  const handleMediaSelect = useCallback(
    (media: MediaImage) => {
      setField('coverImageUrl', media.url);
      setIsPickerOpen(false);
    },
    [setField],
  );

  const navigateAway = useCallback(() => {
    router.push('/dashboard/articles');
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
    isPickerOpen,
    openImagePicker,
    closeImagePicker,
    handleMediaSelect,
    handleSubmit,
    handleCancel,
    handleBack,
    confirmDiscard,
    closeDiscardDialog,
  };
}
