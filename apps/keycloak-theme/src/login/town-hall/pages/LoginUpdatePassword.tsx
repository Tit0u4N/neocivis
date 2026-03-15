import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { PageProps } from 'keycloakify/login/pages/PageProps';
import { useIsPasswordRevealed } from 'keycloakify/tools/useIsPasswordRevealed';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

type Props = PageProps<Extract<KcContext, { pageId: 'login-update-password.ftl' }>, I18n>;

function PasswordField({
  id,
  label,
  hasError,
  errorNode,
  ...props
}: {
  id: string;
  label: ReactNode;
  hasError: boolean;
  errorNode?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId: id });

  return (
    <Field>
      <FieldLabel htmlFor={id} className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </FieldLabel>
      <div className="relative">
        <Input id={id} type={isPasswordRevealed ? 'text' : 'password'} aria-invalid={hasError} {...props} />
        <button
          type="button"
          onClick={toggleIsPasswordRevealed}
          aria-label={isPasswordRevealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          {isPasswordRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errorNode}
    </Field>
  );
}

export function TownHallLoginUpdatePassword({ kcContext, i18n, doUseDefaultCss, Template, classes }: Props) {
  const { url, messagesPerField, isAppInitiatedAction } = kcContext;
  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError('password', 'password-confirm')}
      headerNode={msg('updatePasswordTitle')}
    >
      <form id="kc-passwd-update-form" action={url.loginAction} method="post">
        <FieldGroup>
          <PasswordField
            id="password-new"
            name="password-new"
            label={msg('passwordNew')}
            autoFocus
            autoComplete="new-password"
            hasError={messagesPerField.existsError('password', 'password-confirm')}
            errorNode={
              messagesPerField.existsError('password') && (
                <FieldError
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get('password')) }}
                />
              )
            }
          />

          <PasswordField
            id="password-confirm"
            name="password-confirm"
            label={msg('passwordConfirm')}
            autoComplete="new-password"
            hasError={messagesPerField.existsError('password', 'password-confirm')}
            errorNode={
              messagesPerField.existsError('password-confirm') && (
                <FieldError
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get('password-confirm')) }}
                />
              )
            }
          />

          <Field>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                id="logout-sessions"
                name="logout-sessions"
                value="on"
                defaultChecked
                className="h-4 w-4 border-border accent-primary"
              />
              <span className="text-foreground text-sm tracking-wide">{msg('logoutOtherSessions')}</span>
            </label>
          </Field>

          <div className="flex gap-4">
            {isAppInitiatedAction && (
              <button
                type="submit"
                name="cancel-aia"
                value="true"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary px-6 py-3 font-semibold text-primary text-sm uppercase tracking-widest transition-colors hover:bg-accent"
              >
                {msg('doCancel')}
              </button>
            )}
            <Button type="submit" size="lg" className={isAppInitiatedAction ? 'flex-1' : 'w-full'}>
              {msgStr('doSubmit')}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Template>
  );
}
