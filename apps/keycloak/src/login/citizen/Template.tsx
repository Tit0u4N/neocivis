import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { TemplateProps } from 'keycloakify/login/TemplateProps';
import { Building2 } from 'lucide-react';
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
  const { msg, enabledLanguages, currentLanguage } = i18n;

  return (
    <div className="theme-citizen citizen-bg flex min-h-screen items-center justify-center p-4">
      {/* Language switcher */}
      {enabledLanguages.length > 1 && (
        <div className="absolute top-4 right-4">
          <select
            className="cursor-pointer rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            value={currentLanguage.languageTag}
            onChange={(e) => {
              const lang = enabledLanguages.find((l) => l.languageTag === e.target.value);
              if (lang) {
                window.location.href = lang.href;
              }
            }}
          >
            {enabledLanguages.map((lang) => (
              <option key={lang.languageTag} value={lang.languageTag} className="text-foreground">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="w-full max-w-sm animate-in-citizen">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-bold text-2xl text-white">NeoCivis</h1>
          <p className="mt-1 text-sm text-white/70">{msg('app-tagline-citizen')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card p-8 shadow-2xl">
          <h2 className="mb-6 font-semibold text-card-foreground text-xl">{headerNode}</h2>

          {displayMessage && message !== undefined && (
            <div
              className={cn(
                'mb-4 rounded-lg border-l-4 px-4 py-3 text-sm',
                alertVariants[message.type] ?? alertVariants.info,
              )}
              dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
            />
          )}

          {children}

          {displayInfo && infoNode && (
            <div className="mt-6 border-border border-t pt-6 text-center text-muted-foreground text-sm">{infoNode}</div>
          )}
        </div>

        <p className="mt-6 text-center text-white/50 text-xs">
          &copy; {new Date().getFullYear()} NeoCivis — Services Municipaux Numériques
        </p>
      </div>
    </div>
  );
}
