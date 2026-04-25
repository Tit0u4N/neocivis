
// TODO: test data that will be deleted soon, in the future replace with env variables or config files
export const oidcConfig = {
  authority: "https://auth.neocivis.cloud/realms/neocivis/", // L'URL de base + le realm
  client_id: "neocivis-townhall-app",                             // Votre Client ID
  redirect_uri: "http://localhost:3000",             // L'URL de votre app React
  response_type: "code",                             // "code" force le flux PKCE
  scope: "openid profile email",
};