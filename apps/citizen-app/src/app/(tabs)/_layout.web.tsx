import { Tabs } from 'expo-router';
import { CircleUser, Landmark, MessageSquare, TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/useColor';

export default function WebTabsLayout() {
  const primary = useColor('primary');
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
      }}
    >
      <Tabs.Screen
        name="(city)"
        options={{
          title: t('tabs.city'),
          tabBarIcon: ({ color }) => <Icon name={Landmark} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: t('tabs.report'),
          tabBarIcon: ({ color }) => <Icon name={TriangleAlert} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: t('tabs.forum'),
          tabBarIcon: ({ color }) => <Icon name={MessageSquare} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color }) => <Icon name={CircleUser} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
