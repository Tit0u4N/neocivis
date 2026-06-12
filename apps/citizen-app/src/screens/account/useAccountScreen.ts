import { UpdateAccountInput } from '@repo/contracts/user-schema';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useServices } from '@/providers/ServicesProvider';

type FormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export type AccountScreenViewModel = {
  form: FormState;
  isLoading: boolean;
  loadError: string | null;
  editingField: keyof FormState | null;
  editingValue: string;
  editingError: string | null;
  isEditSubmitting: boolean;
  passwordSheetOpen: boolean;
  isPasswordSubmitting: boolean;
  passwordError: string | null;
  passwordSuccess: string | null;
  openEditField: (field: keyof FormState) => void;
  setEditingValue: (value: string) => void;
  confirmEditField: () => Promise<void>;
  closeEditField: () => void;
  openPasswordSheet: () => void;
  closePasswordSheet: () => void;
  confirmPasswordReset: () => Promise<void>;
  handleLogout: () => void;
};

const DEFAULT_FORM: FormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
};

export function useAccountScreen(): AccountScreenViewModel {
  const { userService } = useServices();
  const { logout } = useAuth();

  const [form, setFormState] = useState<FormState>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<keyof FormState | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingError, setEditingError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const user = await userService.getMe();
        setFormState({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        });
      } catch {
        setLoadError('Impossible de charger les informations du compte.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [userService]);

  const openEditField = useCallback(
    (field: keyof FormState) => {
      setEditingField(field);
      setEditingValue(form[field]);
      setEditingError(null);
    },
    [form],
  );

  const closeEditField = useCallback(() => {
    setEditingField(null);
    setEditingValue('');
    setEditingError(null);
  }, []);

  const confirmEditField = useCallback(async () => {
    if (!editingField) {
      return;
    }

    const result = UpdateAccountInput.safeParse({ [editingField]: editingValue });
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === editingField);
      setEditingError(issue?.message ?? 'Valeur invalide.');
      return;
    }

    setIsEditSubmitting(true);
    setEditingError(null);
    try {
      await userService.updateMe({ [editingField]: editingValue });
      setFormState((prev) => ({ ...prev, [editingField]: editingValue }));
      setEditingField(null);
      setEditingValue('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setEditingError(msg);
    } finally {
      setIsEditSubmitting(false);
    }
  }, [editingField, editingValue, userService]);

  const openPasswordSheet = useCallback(() => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordSheetOpen(true);
  }, []);

  const closePasswordSheet = useCallback(() => {
    setPasswordSheetOpen(false);
  }, []);

  const confirmPasswordReset = useCallback(async () => {
    setPasswordError(null);
    setIsPasswordSubmitting(true);
    try {
      await userService.changePassword();
      setPasswordSheetOpen(false);
      setPasswordSuccess(`Un email de réinitialisation a été envoyé à ${form.email}.`);
    } catch {
      setPasswordError("Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }, [form.email, userService]);

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  return {
    form,
    isLoading,
    loadError,
    editingField,
    editingValue,
    editingError,
    isEditSubmitting,
    passwordSheetOpen,
    isPasswordSubmitting,
    passwordError,
    passwordSuccess,
    openEditField,
    setEditingValue,
    confirmEditField,
    closeEditField,
    openPasswordSheet,
    closePasswordSheet,
    confirmPasswordReset,
    handleLogout,
  };
}
