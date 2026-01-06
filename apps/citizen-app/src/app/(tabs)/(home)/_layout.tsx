import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';

export default function HomeLayout() {
  const theme = useColorScheme();
  const text = useColor('text');
  const background = useColor('background');

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: true,
        headerTintColor: text,
        headerBlurEffect: isLiquidGlassAvailable()
          ? undefined
          : theme === 'dark'
            ? 'systemMaterialDark'
            : 'systemMaterialLight',
        headerStyle: {
          backgroundColor: isLiquidGlassAvailable() ? 'transparent' : background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => (Platform.OS === 'android' ? <Text variant="heading">Home</Text> : undefined),
        }}
      />
    </Stack>
  );
}
