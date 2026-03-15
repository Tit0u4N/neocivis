import DefaultPage from 'keycloakify/login/DefaultPage';
import type { I18n } from '../i18n';
import type { KcContext } from '../KcContext';
import UserProfileFormFields from '../UserProfileFormFields';
import { TownHallLogin } from './pages/Login';
import { TownHallLoginResetPassword } from './pages/LoginResetPassword';
import { TownHallLoginUpdatePassword } from './pages/LoginUpdatePassword';
import { TownHallRegister } from './pages/Register';
import { TownHallTemplate } from './Template';

export function TownHallKcPage({ kcContext, i18n }: { kcContext: KcContext; i18n: I18n }) {
  switch (kcContext.pageId) {
    case 'login.ftl':
      return (
        <TownHallLogin
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={TownHallTemplate}
          classes={{}}
        />
      );
    case 'register.ftl':
      return (
        <TownHallRegister
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={TownHallTemplate}
          classes={{}}
          UserProfileFormFields={UserProfileFormFields}
          doMakeUserConfirmPassword
        />
      );
    case 'login-reset-password.ftl':
      return (
        <TownHallLoginResetPassword
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={TownHallTemplate}
          classes={{}}
        />
      );
    case 'login-update-password.ftl':
      return (
        <TownHallLoginUpdatePassword
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss={false}
          Template={TownHallTemplate}
          classes={{}}
        />
      );
    default:
      return (
        <DefaultPage
          kcContext={kcContext}
          i18n={i18n}
          doUseDefaultCss
          Template={TownHallTemplate}
          classes={{}}
          UserProfileFormFields={UserProfileFormFields}
          doMakeUserConfirmPassword
        />
      );
  }
}
