// Surcharge dynamique de app.json.
// Mode démo statique (`EXPO_PUBLIC_DEMO_MODE=true`) : export web en SPA (routes dynamiques
// résolues côté client, compatible GitHub Pages) servi sous `EXPO_PUBLIC_BASE_PATH`.
const isDemo = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const basePath = process.env.EXPO_PUBLIC_BASE_PATH;

module.exports = ({ config }) => {
  if (!isDemo) {
    return config;
  }
  return {
    ...config,
    web: { ...config.web, output: 'single' },
    experiments: { ...config.experiments, ...(basePath ? { baseUrl: basePath } : {}) },
  };
};
