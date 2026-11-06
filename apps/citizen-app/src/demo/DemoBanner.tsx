import { FlaskConical } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { IS_DEMO_MODE } from './demo-mode';

/**
 * Bandeau signalant la version de démonstration (données fictives, non persistées).
 * Rendu uniquement en mode démo ; sur le web, « Réinitialiser » recharge les données de seed.
 */
export function DemoBanner() {
  const insets = useSafeAreaInsets();
  const background = useColor('primary');
  const foreground = useColor('primaryForeground');

  if (!IS_DEMO_MODE) {
    return null;
  }

  const canReset = Platform.OS === 'web' && typeof window !== 'undefined';

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: background, paddingTop: insets.top + 6 }]}
    >
      <FlaskConical size={14} color={foreground} />
      <Text style={[styles.text, { color: foreground }]}>
        <Text style={[styles.text, styles.bold, { color: foreground }]}>Démo</Text> · données fictives
      </Text>
      {canReset && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réinitialiser les données de démo"
          onPress={() => window.location.reload()}
          style={styles.reset}
        >
          <Text style={[styles.text, styles.bold, styles.underline, { color: foreground }]}>Réinitialiser</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  text: { fontSize: 12, lineHeight: 16 },
  bold: { fontWeight: '600' },
  underline: { textDecorationLine: 'underline' },
  reset: { marginLeft: 6 },
});
