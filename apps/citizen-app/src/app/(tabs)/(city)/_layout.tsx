import { Stack } from 'expo-router';
import { useColor } from '@/hooks/useColor';

export default function CityLayout() {
  const text = useColor('text');
  const background = useColor('background');

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: false,
        headerTintColor: text,
        headerStyle: {
          backgroundColor: background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
