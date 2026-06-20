import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// biome-ignore lint/style/noDefaultExport: required by Expo Router
export default function AuthRedirect() {
  return null;
}
