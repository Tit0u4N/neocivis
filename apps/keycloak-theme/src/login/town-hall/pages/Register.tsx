import type { PageProps } from 'keycloakify/login/pages/PageProps';
import type { UserProfileFormFieldsProps } from 'keycloakify/login/UserProfileFormFieldsProps';
import type { LazyOrNot } from 'keycloakify/tools/LazyOrNot';
import type { JSX } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import type { I18n } from '../../i18n';
import type { KcContext } from '../../KcContext';

type Props = PageProps<Extract<KcContext, { pageId: 'register.ftl' }>, I18n> & {
  UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
  doMakeUserConfirmPassword: boolean;
};

export function TownHallRegister({
  kcContext,
  i18n,
  doUseDefaultCss,
  Template,
  classes,
  UserProfileFormFields,
  doMakeUserConfirmPassword,
}: Props) {
  const { url, messagesPerField, messageHeader } = kcContext;
  const { msg, msgStr, advancedMsg } = i18n;
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={messageHeader !== undefined ? advancedMsg(messageHeader) : msg('registerTitle')}
      displayMessage={messagesPerField.exists('global')}
      displayRequiredFields
    >
      <form id="kc-register-form" action={url.registrationAction} method="post">
        <FieldGroup>
          <UserProfileFormFields
            kcContext={kcContext}
            i18n={i18n}
            kcClsx={() => ''}
            onIsFormSubmittableValueChange={setIsFormSubmittable}
            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
          />

          <div className="flex gap-4 pt-2">
            <a
              href={url.loginUrl}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary px-6 py-3 font-semibold text-primary text-sm uppercase tracking-widest transition-colors hover:bg-accent"
            >
              {msg('doCancel')}
            </a>
            <Button type="submit" size="lg" disabled={!isFormSubmittable} className="flex-1">
              {msgStr('doRegister')}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Template>
  );
}
