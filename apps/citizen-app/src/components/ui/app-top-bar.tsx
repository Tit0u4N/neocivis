import { Bell } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useCityStore } from '@/stores/city.store';

const BAR_HEIGHT = 52;

export function AppTopBar() {
  const insets = useSafeAreaInsets();
  const bgColor = useColor('background');
  const borderColor = useColor('border');
  const primaryColor = useColor('primary');
  const textColor = useColor('text');
  const { city } = useCityStore();

  return (
    <View style={[styles.bar, { paddingTop: insets.top, backgroundColor: bgColor, borderBottomColor: borderColor }]}>
      <View style={styles.inner}>
        <Text style={[styles.cityName, { color: textColor }]}>{city?.name ?? ''}</Text>
        <TouchableOpacity style={styles.bellBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Bell size={22} color={primaryColor} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bellBtn: {
    padding: 4,
  },
});
