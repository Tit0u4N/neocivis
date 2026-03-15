import { Suspense } from 'react';
import { CitizenKcPage } from './citizen/KcPage';
import { useI18n } from './i18n';
import type { KcContext } from './KcContext';
import { TownHallKcPage } from './town-hall/KcPage';

export function KcPage({ kcContext }: { kcContext: KcContext }) {
  const { i18n } = useI18n({ kcContext });

  return (
    <Suspense>
      {kcContext.themeName === 'citizen' ? (
        <CitizenKcPage kcContext={kcContext} i18n={i18n} />
      ) : (
        <TownHallKcPage kcContext={kcContext} i18n={i18n} />
      )}
    </Suspense>
  );
}
