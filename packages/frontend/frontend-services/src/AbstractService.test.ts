import type { KyInstance } from 'ky';
import { describe, expect, it, vi } from 'vitest';
import AbstractService, { type AbstractServiceConfig } from './AbstractService';

class TestService extends AbstractService {
  constructor(kyInstance: KyInstance, config?: AbstractServiceConfig) {
    super(kyInstance, config);
  }

  get internalHttp(): KyInstance {
    return this.http;
  }
}

type ParentOptions = { prefixUrl: string; hooks?: { beforeRequest?: Array<() => void> } };
type ExtendedOptions = { prefixUrl: string; hooks: { beforeRequest: Array<() => void> } };
type ExtendFactory = (parent: ParentOptions) => ExtendedOptions;

function makeKy() {
  const extended = { __marker: 'extended' };
  const extend = vi.fn().mockReturnValue(extended);
  return {
    ky: { extend } as unknown as KyInstance,
    extend,
    extended,
  };
}

function getExtendedOptions(extend: ReturnType<typeof vi.fn>, parent: ParentOptions = { prefixUrl: '' }): ExtendedOptions {
  const factory = extend.mock.calls[0]?.[0] as ExtendFactory | undefined;
  if (!factory) {
    throw new Error('extend was not called');
  }
  return factory(parent);
}

describe('AbstractService', () => {
  describe('cityScoped (default true)', () => {
    it('prepends /cities/{cityId} when cityId is provided', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityId: 'NIC_06000' });

      const { prefixUrl } = getExtendedOptions(extend, { prefixUrl: 'http://api/' });
      expect(prefixUrl).toBe('http://api//cities/NIC_06000');
    });

    it('appends `prefix` after the city scope', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityId: 'NIC_06000', prefix: '/config' });

      const { prefixUrl } = getExtendedOptions(extend, { prefixUrl: 'http://api' });
      expect(prefixUrl).toBe('http://api/cities/NIC_06000/config');
    });
  });

  describe('request-time validation', () => {
    it('does NOT throw at construction when cityId is missing', () => {
      const { ky } = makeKy();
      expect(() => new TestService(ky)).not.toThrow();
      expect(() => new TestService(ky, {})).not.toThrow();
      expect(() => new TestService(ky, { prefix: '/config' })).not.toThrow();
    });

    it('registers a beforeRequest hook that throws when cityId is missing (default cityScoped)', () => {
      const { ky, extend } = makeKy();
      new TestService(ky);

      const { hooks } = getExtendedOptions(extend);
      const beforeRequest = hooks.beforeRequest[0];
      expect(beforeRequest).toBeTypeOf('function');
      expect(() => beforeRequest()).toThrow(/cityId/);
    });

    it('beforeRequest hook does NOT throw when cityId is provided', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityId: 'NIC_06000' });

      const { hooks } = getExtendedOptions(extend);
      expect(() => hooks.beforeRequest[0]()).not.toThrow();
    });

    it('beforeRequest hook does NOT throw when cityScoped is explicitly false', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityScoped: false });

      const { hooks } = getExtendedOptions(extend);
      expect(() => hooks.beforeRequest[0]()).not.toThrow();
    });

    it('preserves parent beforeRequest hooks (e.g. auth) and appends its own', () => {
      const { ky, extend } = makeKy();
      const parentHook = vi.fn();
      new TestService(ky, { cityId: 'NIC_06000' });

      const { hooks } = getExtendedOptions(extend, {
        prefixUrl: 'http://api',
        hooks: { beforeRequest: [parentHook] },
      });

      expect(hooks.beforeRequest).toHaveLength(2);
      expect(hooks.beforeRequest[0]).toBe(parentHook);
      expect(() => hooks.beforeRequest[1]()).not.toThrow();
    });
  });

  describe('cityScoped: false', () => {
    it('produces an empty prefix when no `prefix` is given', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityScoped: false });

      const { prefixUrl } = getExtendedOptions(extend, { prefixUrl: 'http://api' });
      expect(prefixUrl).toBe('http://api');
    });

    it('uses the provided `prefix` alone', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityScoped: false, prefix: '/cities' });

      const { prefixUrl } = getExtendedOptions(extend, { prefixUrl: 'http://api' });
      expect(prefixUrl).toBe('http://api/cities');
    });

    it('ignores cityId when cityScoped is explicitly false', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityScoped: false, cityId: 'NIC_06000', prefix: '/uploads' });

      const { prefixUrl } = getExtendedOptions(extend, { prefixUrl: 'http://api' });
      expect(prefixUrl).toBe('http://api/uploads');
    });
  });

  describe('http wiring', () => {
    it('calls kyInstance.extend exactly once with a factory function', () => {
      const { ky, extend } = makeKy();
      new TestService(ky, { cityScoped: false });

      expect(extend).toHaveBeenCalledTimes(1);
      expect(typeof extend.mock.calls[0][0]).toBe('function');
    });

    it('stores the extended ky instance on `http`', () => {
      const { ky, extended } = makeKy();
      const service = new TestService(ky, { cityScoped: false });

      expect(service.internalHttp).toBe(extended);
    });
  });
});
