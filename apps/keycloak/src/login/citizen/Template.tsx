import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { TemplateProps } from 'keycloakify/login/TemplateProps';
import neocivisLogoWhite from '@/assets/neocivis_logo_white.svg?url';
import { cn } from '@/lib/utils';
import type { I18n } from '../i18n';
import type { KcContext } from '../KcContext';

const alertVariants: Record<string, string> = {
  error: 'bg-destructive/10 text-destructive border-destructive',
  success: 'bg-green-50 text-green-800 border-green-600',
  warning: 'bg-amber-50 text-amber-800 border-amber-600',
  info: 'bg-blue-50 text-blue-800 border-blue-600',
};

export function CitizenTemplate(props: TemplateProps<KcContext, I18n>) {
  const { kcContext, i18n, children, headerNode, infoNode, displayMessage = true, displayInfo = false } = props;
  const { message } = kcContext;
  const { enabledLanguages, currentLanguage } = i18n;

  return (
    <div className="theme-citizen citizen-fullscreen">
      {/* Language switcher */}
      {enabledLanguages.length > 1 && (
        <div className="fixed top-4 right-4 z-50">
          <select
            className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-white backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            value={currentLanguage.languageTag}
            onChange={(e) => {
              const lang = enabledLanguages.find((l) => l.languageTag === e.target.value);
              if (lang) {
                window.location.href = lang.href;
              }
            }}
          >
            {enabledLanguages.map((lang) => (
              <option key={lang.languageTag} value={lang.languageTag}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Hero */}
      <div className="citizen-hero">
        <div className="citizen-ring-lg" aria-hidden />
        <div className="citizen-ring-sm" aria-hidden />

        <div className="relative z-10 flex h-full animate-in-citizen flex-col justify-between px-7 pt-14 pb-16 md:pt-16 md:pb-20">
          <img src={neocivisLogoWhite} alt="NeoCivis" className="h-7 w-auto object-contain object-left" />
          <div>
            <p className="citizen-kicker">BIENVENUE SUR</p>
            <h1 className="citizen-hero-title">NeoCivis</h1>
          </div>
        </div>
      </div>

      {/* Sheet */}
      <div className="citizen-sheet">
        <div className="flex animate-in-citizen flex-col gap-4 px-7 pt-9 pb-8">
          <h2 className="font-semibold text-card-foreground text-xl">{headerNode}</h2>

          {displayMessage && message !== undefined && (
            <div
              className={cn(
                'rounded-lg border-l-4 px-4 py-3 text-sm',
                alertVariants[message.type] ?? alertVariants.info,
              )}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: keycloak sanitizes this
              dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
            />
          )}

          {children}

          {displayInfo && infoNode && (
            <div className="border-border border-t pt-5 text-center text-muted-foreground text-sm">{infoNode}</div>
          )}

          <p className="mt-4 text-center text-muted-foreground/50 text-xs">
            &copy; {new Date().getFullYear()} NeoCivis
          </p>
        </div>
      </div>
    </div>
  );
}
