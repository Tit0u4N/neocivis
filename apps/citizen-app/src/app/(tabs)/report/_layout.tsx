import { Stack } from 'expo-router';
import { useColor } from '@/hooks/useColor';

export default function ReportLayout() {
  const text = useColor('text');
  const background = useColor('background');

  return (
    <Stack
      screenOptions={{
        headerTintColor: text,
        headerStyle: { backgroundColor: background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
