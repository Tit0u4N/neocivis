import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { TemplateProps } from 'keycloakify/login/TemplateProps';
import neocivisIconColor from '@/assets/neocivi-icon-cx300.png';
import { cn } from '@/lib/utils';
import type { I18n } from '../i18n';
import type { KcContext } from '../KcContext';

const alertVariants: Record<string, string> = {
  error: 'bg-destructive/10 text-destructive border-destructive',
  success: 'bg-green-50 text-green-800 border-green-600',
  warning: 'bg-amber-50 text-amber-800 border-amber-600',
  info: 'bg-blue-50 text-blue-800 border-blue-600',
};

export function TownHallTemplate(props: TemplateProps<KcContext, I18n>) {
  const { kcContext, i18n, children, headerNode, infoNode, displayMessage = true, displayInfo = false } = props;

  const { message } = kcContext;
  const { enabledLanguages, currentLanguage } = i18n;

  return (
    <div className="theme-town-hall flex min-h-screen animate-in-town-hall flex-col bg-background">
      {/* Gold accent bar */}
      <div className="h-1 w-full bg-secondary" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Brand */}
        <div className="mb-8 flex w-full max-w-sm items-center gap-3">
          <div className="flex items-center">
            <img src={neocivisIconColor} alt="NeoCivis" className="size-12 object-contain" />
            <span className="mt-2 font-bold text-primary text-xl uppercase tracking-widest">NeoCivis</span>
          </div>

          {/* Language switcher */}
          {enabledLanguages.length > 1 && (
            <div className="ml-auto">
              <select
                className="rounded-lg border border-border bg-background px-2 py-1 text-muted-foreground text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
        </div>

        {/* Content */}
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-bold text-2xl text-primary uppercase tracking-tight">{headerNode}</h2>
            <div className="mt-2 h-0.5 w-12 bg-secondary" />
          </div>

          {displayMessage && message !== undefined && (
            <div
              className={cn(
                'mb-6 rounded-lg border-l-4 px-4 py-3 text-sm',
                alertVariants[message.type] ?? alertVariants.info,
              )}
              dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
            />
          )}

          {children}

          {displayInfo && infoNode && (
            <div className="mt-8 border-border border-t pt-6 text-center text-muted-foreground text-sm">{infoNode}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-border border-t px-4 py-3">
        <p className="text-center text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} NeoCivis — Portail NEOCIVIS
        </p>
      </div>
    </div>
  );
}
