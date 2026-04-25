import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const lightColors = {
  // Base colors — aligned with .theme-citizen in global.css
  background: '#FFFFFF',
  foreground: '#0A0A0A',

  // Card colors
  card: '#FFFFFF',
  cardForeground: '#0A0A0A',

  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#0A0A0A',

  // Primary colors — hsl(0 0% 9.05%)
  primary: '#171717',
  primaryForeground: '#FAFAFA',

  // Secondary colors — hsl(0 0% 96.06%)
  secondary: '#F5F5F5',
  secondaryForeground: '#171717',

  // Muted colors — hsl(0 0% 96.06%) / hsl(0 0% 45.15%)
  muted: '#F5F5F5',
  mutedForeground: '#737373',

  // Accent colors
  accent: '#F5F5F5',
  accentForeground: '#171717',

  // Destructive colors
  destructive: '#ef4444',
  destructiveForeground: '#FFFFFF',

  // Success colors
  successForeground: '#FFFFFF',

  // Border and input — hsl(0 0% 89.82%)
  border: '#E5E5E5',
  input: '#E5E5E5',
  ring: '#A1A1A1',

  // Text colors
  text: '#0A0A0A',
  textMuted: '#737373',

  // Legacy support for existing components
  tint: '#18181b',
  icon: '#71717a',
  tabIconDefault: '#71717a',
  tabIconSelected: '#18181b',

  // Default buttons, links, Send button, selected tabs
  blue: '#007AFF',

  // Success states, FaceTime buttons, completed tasks
  green: '#34C759',

  // Delete buttons, error states, critical alerts
  red: '#FF3B30',

  // VoiceOver highlights, warning states
  orange: '#FF9500',

  // Notes app accent, Reminders highlights
  yellow: '#FFCC00',

  // Pink accent color for various UI elements
  pink: '#FF2D92',

  // Purple accent for creative apps and features
  purple: '#AF52DE',

  // Teal accent for communication features
  teal: '#5AC8FA',

  // Indigo accent for system features
  indigo: '#5856D6',
};

export const darkColors = {
  // Base colors — aligned with .theme-citizen.dark in global.css
  background: '#0A0A0A',
  foreground: '#FAFAFA',

  // Card colors — hsl(0 0% 9.05%)
  card: '#171717',
  cardForeground: '#FAFAFA',

  // Popover colors — hsl(0 0% 14.94%)
  popover: '#262626',
  popoverForeground: '#FAFAFA',

  // Primary colors — hsl(0 0% 89.82%)
  primary: '#E5E5E5',
  primaryForeground: '#171717',

  // Secondary colors — hsl(0 0% 14.94%)
  secondary: '#262626',
  secondaryForeground: '#FAFAFA',

  // Muted colors — hsl(0 0% 14.94%) / hsl(0 0% 63.02%)
  muted: '#262626',
  mutedForeground: '#A1A1A1',

  // Accent colors — hsl(0 0% 25.05%)
  accent: '#404040',
  accentForeground: '#FAFAFA',

  // Destructive colors — hsl(359 100% 70%)
  destructive: '#fc8181',
  destructiveForeground: '#FAFAFA',

  // Success colors
  successForeground: '#FFFFFF',

  // Border and input — hsl(0 0% 15.51%) / hsl(0 0% 20.39%)
  border: '#272727',
  input: '#343434',
  ring: '#737373',

  // Text colors
  text: '#FAFAFA',
  textMuted: '#A1A1A1',

  // Legacy support for existing components
  tint: '#FFFFFF',
  icon: '#a1a1aa',
  tabIconDefault: '#a1a1aa',
  tabIconSelected: '#FFFFFF',

  // Default buttons, links, Send button, selected tabs
  blue: '#0A84FF',

  // Success states, FaceTime buttons, completed tasks
  green: '#30D158',

  // Delete buttons, error states, critical alerts
  red: '#FF453A',

  // VoiceOver highlights, warning states
  orange: '#FF9F0A',

  // Notes app accent, Reminders highlights
  yellow: '#FFD60A',

  // Pink accent color for various UI elements
  pink: '#FF375F',

  // Purple accent for creative apps and features
  purple: '#BF5AF2',

  // Teal accent for communication features
  teal: '#64D2FF',

  // Indigo accent for system features
  indigo: '#5E5CE6',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};
