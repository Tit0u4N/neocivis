import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { useColor } from '@/hooks/useColor';

export default function CityLayout() {
  const text = useColor('text');
  const background = useColor('background');

  return (
    <View style={{ flex: 1 }}>
      <AppTopBar />
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
    </View>
  );
}
