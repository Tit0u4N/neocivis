import { Tabs } from 'expo-router';
import { CircleUser, Landmark, MessageSquare, Star, TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Icon } from '@/components/ui/icon';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen
        name="(city)"
        options={{
          title: t('tabs.city'),
          tabBarIcon: ({ color }) => <Icon name={Landmark} size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: t('tabs.news'),
          tabBarIcon: ({ color }) => <Icon name={Star} size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: t('tabs.forum'),
          tabBarIcon: ({ color }) => <Icon name={MessageSquare} size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: t('tabs.report'),
          tabBarIcon: ({ color }) => <Icon name={TriangleAlert} size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color }) => <Icon name={CircleUser} size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
