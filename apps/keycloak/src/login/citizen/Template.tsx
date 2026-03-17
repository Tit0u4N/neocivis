import { kcSanitize } from 'keycloakify/lib/kcSanitize';
import type { TemplateProps } from 'keycloakify/login/TemplateProps';
import neocivisIconBw from '@/assets/neocivi-icon-bwx300.png';
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
    <div className="theme-citizen citizen-bg flex min-h-screen items-center justify-center p-4">
      {/* Language switcher */}
      {enabledLanguages.length > 1 && (
        <div className="fixed top-4 right-4 ml-auto">
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

      <div className="w-full max-w-sm animate-in-citizen">
        {/* Card */}
        <div className="rounded-2xl bg-card p-8 shadow-2xl">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <img src={neocivisIconBw} alt="NeoCivis" className="size-20 object-contain" />
            </div>
            <h1 className="font-bold text-2xl">NeoCivis</h1>
          </div>
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

        <p className="mt-6 text-center text-white/50 text-xs">&copy; {new Date().getFullYear()} NeoCivis</p>
      </div>
    </div>
  );
}
