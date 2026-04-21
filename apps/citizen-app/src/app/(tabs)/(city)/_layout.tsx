import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';

export default function CityLayout() {
  const text = useColor('text');
  const background = useColor('background');
  const { t } = useTranslation();

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
      <Stack.Screen
        name="index"
        options={{
          title: t('city.title'),
          headerTitle: () => (Platform.OS === 'android' ? <Text variant="heading">{t('city.title')}</Text> : undefined),
        }}
      />
    </Stack>
  );
}
