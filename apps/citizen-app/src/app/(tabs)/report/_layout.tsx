import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColor } from '@/hooks/useColor';

export default function ReportLayout() {
  const { t } = useTranslation();
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
      <Stack.Screen name="new" options={{ title: t('report.newReport') }} />
      <Stack.Screen name="[id]" options={{ title: t('report.detail.headerTitle') }} />
    </Stack>
  );
}
