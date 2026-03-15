import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { PageProps } from 'keycloakify/login/pages/PageProps';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

type Props = PageProps<Extract<KcContext, { pageId: 'login-reset-password.ftl' }>, I18n>;

export function CitizenLoginResetPassword({ kcContext, i18n, doUseDefaultCss, Template, classes }: Props) {
  const { url, realm, auth, messagesPerField } = kcContext;
  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayInfo
      displayMessage={!messagesPerField.existsError('username')}
      infoNode={
        <span className="text-muted-foreground">
          {realm.duplicateEmailsAllowed ? msg('emailInstructionUsername') : msg('emailInstruction')}
        </span>
      }
      headerNode={
        <span className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          {msg('emailForgotTitle')}
        </span>
      }
    >
      <form id="kc-reset-password-form" action={url.loginAction} method="post">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">
              {realm.loginWithEmailAllowed
                ? realm.registrationEmailAsUsername
                  ? msg('email')
                  : msg('usernameOrEmail')
                : msg('username')}
            </FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              autoFocus
              defaultValue={auth.attemptedUsername ?? ''}
              aria-invalid={messagesPerField.existsError('username')}
              aria-describedby={messagesPerField.existsError('username') ? 'username-error' : undefined}
            />
            {messagesPerField.existsError('username') && (
              <FieldError
                id="username-error"
                aria-live="polite"
                dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get('username')) }}
              />
            )}
          </Field>

          <div className="flex gap-3">
            <a
              href={url.loginUrl}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-border px-5 py-3 font-semibold text-primary text-sm transition-colors hover:bg-accent"
            >
              {msg('backToLogin')}
            </a>
            <Button type="submit" size="lg" className="flex-1">
              {msgStr('doSubmit')}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Template>
  );
}
