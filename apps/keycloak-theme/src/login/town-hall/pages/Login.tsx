import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { PageProps } from 'keycloakify/login/pages/PageProps';
import { useIsPasswordRevealed } from 'keycloakify/tools/useIsPasswordRevealed';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

type Props = PageProps<Extract<KcContext, { pageId: 'login.ftl' }>, I18n>;

export function TownHallLogin({ kcContext, i18n, doUseDefaultCss, Template, classes }: Props) {
  const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;
  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId: 'password' });

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError('username', 'password')}
      headerNode={msg('loginAccountTitle')}
      displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
      infoNode={
        <span>
          {msg('noAccount')}{' '}
          <a
            href={url.registrationUrl}
            className="font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          >
            {msg('doRegister')}
          </a>
        </span>
      }
    >
      {/* Social providers */}
      {realm.password && social?.providers !== undefined && social.providers.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col gap-2">
            {social.providers.map((p) => (
              <a
                key={p.alias}
                href={p.loginUrl}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 font-medium text-foreground text-sm uppercase tracking-wider transition-colors hover:bg-accent"
              >
                {p.iconClasses && <i className={p.iconClasses} aria-hidden />}
                <span dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }} />
              </a>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-border border-t" />
            </div>
            <div className="relative flex justify-center bg-background px-3 text-muted-foreground text-xs uppercase tracking-widest">
              ou
            </div>
          </div>
        </div>
      )}

      {realm.password && (
        <form
          id="kc-form-login"
          onSubmit={() => {
            setIsLoginButtonDisabled(true);
            return true;
          }}
          action={url.loginAction}
          method="post"
        >
          <FieldGroup>
            {!usernameHidden && (
              <Field>
                <FieldLabel
                  htmlFor="username"
                  className="font-bold text-muted-foreground text-xs uppercase tracking-widest"
                >
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
                  autoComplete="username"
                  defaultValue={login.username ?? ''}
                  aria-invalid={messagesPerField.existsError('username', 'password')}
                  aria-describedby={messagesPerField.existsError('username', 'password') ? 'username-error' : undefined}
                />
                {messagesPerField.existsError('username', 'password') && (
                  <FieldError
                    id="username-error"
                    aria-live="polite"
                    dangerouslySetInnerHTML={{
                      __html: kcSanitize(messagesPerField.getFirstError('username', 'password')),
                    }}
                  />
                )}
              </Field>
            )}

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor="password"
                  className="font-bold text-muted-foreground text-xs uppercase tracking-widest"
                >
                  {msg('password')}
                </FieldLabel>
                {realm.resetPasswordAllowed && (
                  <a
                    href={url.loginResetCredentialsUrl}
                    className="text-muted-foreground text-xs underline underline-offset-2 transition-colors hover:text-primary"
                  >
                    {msg('doForgotPassword')}
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={isPasswordRevealed ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={messagesPerField.existsError('username', 'password')}
                />
                <button
                  type="button"
                  onClick={toggleIsPasswordRevealed}
                  aria-label={msgStr(isPasswordRevealed ? 'hidePassword' : 'showPassword')}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {isPasswordRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {realm.rememberMe && !usernameHidden && (
              <Field>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    defaultChecked={!!login.rememberMe}
                    className="h-4 w-4 border-border accent-primary"
                  />
                  <span className="text-foreground text-sm tracking-wide">{msg('rememberMe')}</span>
                </label>
              </Field>
            )}

            <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />

            <Field>
              <Button
                type="submit"
                name="login"
                id="kc-login"
                size="lg"
                className="w-full"
                disabled={isLoginButtonDisabled}
              >
                {msgStr('doLogIn')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </Template>
  );
}
