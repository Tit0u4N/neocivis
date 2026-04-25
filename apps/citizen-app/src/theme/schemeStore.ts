type Listener = (scheme: 'light' | 'dark' | null) => void;

let override: 'light' | 'dark' | null = null;
const listeners = new Set<Listener>();

export const schemeStore = {
  get: () => override,
  set: (scheme: 'light' | 'dark' | null) => {
    override = scheme;
    for (const l of listeners) {
      l(scheme);
    }
  },
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
