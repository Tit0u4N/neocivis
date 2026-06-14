import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { useColor } from '@/hooks/useColor';

export default function ForumLayout() {
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
      <Stack.Screen name="index" options={{ header: () => <AppTopBar /> }} />
      <Stack.Screen name="[id]" options={{ title: t('forum.thread.headerTitle') }} />
    </Stack>
  );
}
