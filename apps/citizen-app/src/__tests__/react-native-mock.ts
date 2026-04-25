// Minimal react-native mock for Vitest/RNTL.
// String identifiers make react-test-renderer emit host elements (type:'Text',
// type:'View', etc.) that RNTL's isHostText / isHostElement recognise by name.

export const Text = 'Text';
export const View = 'View';
export const ScrollView = 'ScrollView';
export const Image = 'Image';

export const Linking = {
  openURL: (_url: string): Promise<void> => Promise.resolve(),
};

export const StyleSheet = {
  flatten: (style: unknown): Record<string, unknown> | null => {
    if (!style) {
      return null;
    }
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.map(StyleSheet.flatten).filter(Boolean));
    }
    return style as Record<string, unknown>;
  },
  create: <T extends object>(s: T): T => s,
  hairlineWidth: 1,
};
