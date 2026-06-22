import type { CategoryLink } from '@repo/contracts/config';
import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

/**
 * Returns the onPress handler for a category tile based on its link config.
 * Returns undefined for types with no citizen destination (inert tile).
 */
export function getCategoryLinkAction(link?: CategoryLink): (() => void) | undefined {
  if (!link) {
    return undefined;
  }

  switch (link.type) {
    case 'ExternalURL':
      if (!link.value) {
        return undefined;
      }
      return () => void openBrowserAsync(link.value as string);

    case 'ArticlePage':
      if (!link.value) {
        return undefined;
      }
      return () => router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id: link.value as string } });

    case 'Articles':
      return () => router.push('/(tabs)/news');

    case 'Forum':
      return () => router.push('/(tabs)/forum');

    case 'Reports':
      return () => router.push('/(tabs)/report');

    // General, Establishment, and unknown types → inert
    default:
      return undefined;
  }
}
