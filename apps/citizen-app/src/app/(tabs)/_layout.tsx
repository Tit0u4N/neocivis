import MaterialIcons from '@expo/vector-icons/Feather';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useColor } from '@/hooks/useColor';

export default function TabsLayout() {
  const primary = useColor('primary');
  const foreground = useColor('foreground');
  const { t } = useTranslation();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{
        default: { color: primary },
        selected: { color: foreground },
      }}
      iconColor={{
        default: primary,
        selected: foreground,
      }}
      labelVisibilityMode="labeled"
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="(city)">
        {Platform.select({
          ios: <Icon sf="building.2.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="map-pin" />} />,
        })}
        <Label>{t('tabs.city')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="report">
        {Platform.select({
          ios: <Icon sf="exclamationmark.triangle.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="alert-triangle" />} />,
        })}
        <Label>{t('tabs.report')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="forum">
        {Platform.select({
          ios: <Icon sf="bubble.left.and.bubble.right.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="message-square" />} />,
        })}
        <Label>{t('tabs.forum')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        {Platform.select({
          ios: <Icon sf="person.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="user" />} />,
        })}
        <Label>{t('tabs.account')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
