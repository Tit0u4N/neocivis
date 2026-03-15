import DefaultPage from 'keycloakify/login/DefaultPage';
import type { I18n } from '../i18n';
import type { KcContext } from '../KcContext';
import UserProfileFormFields from '../UserProfileFormFields';
import { CitizenLogin } from './pages/Login';
import { CitizenLoginResetPassword } from './pages/LoginResetPassword';
import { CitizenLoginUpdatePassword } from './pages/LoginUpdatePassword';
import { CitizenRegister } from './pages/Register';
import { CitizenTemplate } from './Template';

export function CitizenKcPage({ kcContext, i18n }: { kcContext: KcContext; i18n: I18n }) {
  switch (kcContext.pageId) {
    case 'login.ftl':
      return (
        <CitizenLogin
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={CitizenTemplate}
          classes={{}}
        />
      );
    case 'register.ftl':
      return (
        <CitizenRegister
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={CitizenTemplate}
          classes={{}}
          UserProfileFormFields={UserProfileFormFields}
          doMakeUserConfirmPassword
        />
      );
    case 'login-reset-password.ftl':
      return (
        <CitizenLoginResetPassword
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={CitizenTemplate}
          classes={{}}
        />
      );
    case 'login-update-password.ftl':
      return (
        <CitizenLoginUpdatePassword
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={CitizenTemplate}
          classes={{}}
        />
      );
    default:
      return (
        <DefaultPage
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss
          Template={CitizenTemplate}
          classes={{}}
          UserProfileFormFields={UserProfileFormFields}
          doMakeUserConfirmPassword
        />
      );
  }
}
