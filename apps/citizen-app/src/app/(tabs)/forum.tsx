import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

export default function ForumScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <AppTopBar />
      <View style={styles.container}>
        <Text variant="heading">{t('forum.title')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
