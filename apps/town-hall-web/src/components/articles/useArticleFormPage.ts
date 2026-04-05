'use client';

import type { ArticleStatus } from '@repo/contracts/article';
import { CreateArticleInput } from '@repo/contracts/article';
import { ArticleService } from '@repo/frontend-services/article';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const articleService = new ArticleService();

type FormState = {
  title: string;
  description: string;
  content: Record<string, unknown>;
  coverImageUrl: string;
  status: ArticleStatus;
};

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  content: {},
  coverImageUrl: '',
  status: 'draft',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function useArticleFormPage(id?: string) {
  const router = useRouter();
  const isEditing = id !== undefined;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
          content: (frTranslation?.content as Record<string, unknown>) ?? {},
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
  }, [id, isEditing]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
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
          content: form.content,
        },
        coverImageUrl: form.coverImageUrl || undefined,
        status: form.status,
      };

      if (isEditing && id) {
        await articleService.update(id, payload);
      } else {
        await articleService.create(payload);
      }
      router.push('/dashboard/articles');
    } catch {
      setApiError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, id, isEditing, router, validate]);

  const handleCancel = useCallback(() => {
    router.push('/dashboard/articles');
  }, [router]);

  return {
    isEditing,
    form,
    errors,
    isLoading,
    isSubmitting,
    apiError,
    setField,
    handleSubmit,
    handleCancel,
  };
}
