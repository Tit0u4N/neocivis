'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('@/components/ui/page-layout', () => ({
  // biome-ignore lint/style/useNamingConvention: React component name in mock object
  PageLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

import { EstablishmentFormPage } from './EstablishmentFormPage';

afterEach(cleanup);

function makeProps(overrides: Partial<Parameters<typeof EstablishmentFormPage>[0]> = {}) {
  return {
    isEditing: false,
    form: {
      name: '',
      type: 'town_hall' as const,
      address: '',
      hours: '',
      phone: '',
      imageUrl: '',
    },
    errors: {},
    isLoading: false,
    isSubmitting: false,
    apiError: null,
    isDirty: false,
    showDiscardDialog: false,
    isPickerOpen: false,
    setField: vi.fn(),
    openImagePicker: vi.fn(),
    closeImagePicker: vi.fn(),
    handleMediaSelect: vi.fn(),
    handleSubmit: vi.fn(),
    handleCancel: vi.fn(),
    handleBack: vi.fn(),
    confirmDiscard: vi.fn(),
    closeDiscardDialog: vi.fn(),
    ...overrides,
  };
}

describe('EstablishmentFormPage', () => {
  it('renders the create title in create mode', () => {
    render(<EstablishmentFormPage {...makeProps({ isEditing: false })} />);
    expect(screen.getAllByText('establishment.form.titleCreate').length).toBeGreaterThan(0);
  });

  it('renders the edit title in edit mode', () => {
    render(<EstablishmentFormPage {...makeProps({ isEditing: true })} />);
    expect(screen.getAllByText('establishment.form.titleEdit').length).toBeGreaterThan(0);
  });

  it('renders skeletons while loading', () => {
    const { container } = render(<EstablishmentFormPage {...makeProps({ isLoading: true })} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows the API error banner when apiError is provided', () => {
    render(<EstablishmentFormPage {...makeProps({ apiError: 'Erreur API' })} />);
    expect(screen.getByText('Erreur API')).toBeTruthy();
  });

  it('shows field-level errors next to inputs', () => {
    render(
      <EstablishmentFormPage
        {...makeProps({
          errors: {
            name: 'Le nom est requis.',
            address: "L'adresse est requise.",
          },
        })}
      />,
    );
    expect(screen.getByText('Le nom est requis.')).toBeTruthy();
    expect(screen.getByText("L'adresse est requise.")).toBeTruthy();
  });

  it('calls setField when name input changes', () => {
    const setField = vi.fn();
    render(<EstablishmentFormPage {...makeProps({ setField })} />);
    const nameInput = screen.getByLabelText('establishment.form.fields.name');
    fireEvent.change(nameInput, { target: { value: 'Mairie' } });
    expect(setField).toHaveBeenCalledWith('name', 'Mairie');
  });

  it('clicking the save button triggers handleSubmit', () => {
    const handleSubmit = vi.fn();
    render(<EstablishmentFormPage {...makeProps({ handleSubmit })} />);
    const saveButton = screen.getByRole('button', { name: 'establishment.form.save' });
    fireEvent.click(saveButton);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('clicking the cancel button triggers handleCancel', () => {
    const handleCancel = vi.fn();
    render(<EstablishmentFormPage {...makeProps({ handleCancel })} />);
    const cancelButton = screen.getByRole('button', { name: 'establishment.form.cancel' });
    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalled();
  });

  it('disables save and cancel buttons while submitting', () => {
    render(<EstablishmentFormPage {...makeProps({ isSubmitting: true })} />);
    const saveButton = screen.getByRole('button', { name: 'establishment.form.save' });
    const cancelButton = screen.getByRole('button', { name: 'establishment.form.cancel' });
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect((cancelButton as HTMLButtonElement).disabled).toBe(true);
  });
});
