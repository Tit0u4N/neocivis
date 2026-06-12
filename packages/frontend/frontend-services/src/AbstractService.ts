import type { KyInstance } from 'ky';

export type AbstractServiceConfig = {
  /** When true (default), automatically prepends `/cities/{cityId}` to the prefix. */
  cityScoped?: boolean;
  /** City id used to build the city-scoped path. Required when `cityScoped` is true. */
  cityId?: string;
  /** Optional path appended after the city scope. Should start with `/` if non-empty. */
  prefix?: string;
};

export default abstract class AbstractService {
  protected http: KyInstance;

  protected constructor(kyInstance: KyInstance, config: AbstractServiceConfig = {}) {
    const { cityScoped = true, cityId, prefix = '' } = config;
    const cityPath = cityScoped && cityId ? `/cities/${cityId}` : '';
    const fullPrefix = cityPath + prefix;
    this.http = kyInstance.extend((parentOptions) => ({
      prefixUrl: parentOptions.prefixUrl + fullPrefix,
      hooks: {
        ...parentOptions.hooks,
        beforeRequest: [
          ...(parentOptions.hooks?.beforeRequest ?? []),
          () => {
            if (cityScoped && !cityId) {
              throw new Error(
                'AbstractService: `cityId` is required when `cityScoped` is true. Pass `{ cityScoped: false }` to opt out.',
              );
            }
          },
        ],
      },
    }));
  }
}
