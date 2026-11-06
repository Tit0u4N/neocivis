// Stub universel pour le bundle démo : remplace les SDK Node (Azure, Postgres, Drizzle, Groq...).
// Tout accès / appel / instanciation renvoie le même proxy, ce qui permet aux modules
// d'être évalués (ex: définitions de tables Drizzle) sans jamais être réellement utilisés.
const target = function stub() {};
const handler = {
  get(_t, key) {
    if (key === Symbol.toPrimitive) {
      return () => '';
    }
    if (key === 'then') {
      return undefined; // ne pas être pris pour une Promise
    }
    if (key === '__esModule') {
      return true;
    }
    return proxy;
  },
  apply() {
    return proxy;
  },
  construct() {
    return proxy;
  },
};
const proxy = new Proxy(target, handler);
export default proxy;
