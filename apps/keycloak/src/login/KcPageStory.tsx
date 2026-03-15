import { createGetKcContextMock } from 'keycloakify/login/KcContext';
import type { DeepPartial } from 'keycloakify/tools/DeepPartial';
import type { KcContext } from './KcContext';
import { KcPage } from './KcPage';

export const { getKcContextMock } = createGetKcContextMock({
  kcContextExtension: {
    themeName: 'citizen',
    properties: {},
  },
  kcContextExtensionPerPage: {},
  overrides: {},
  overridesPerPage: {},
});

export function createKcPageStory<PageId extends KcContext['pageId']>(params: { pageId: PageId }) {
  const { pageId } = params;

  function KcPageStory(props: { kcContext?: DeepPartial<Extract<KcContext, { pageId: PageId }>> }) {
    const { kcContext: overrides } = props;
    const kcContextMock = getKcContextMock({ pageId, overrides });
    return <KcPage kcContext={kcContextMock} />;
  }

  return { KcPageStory };
}
