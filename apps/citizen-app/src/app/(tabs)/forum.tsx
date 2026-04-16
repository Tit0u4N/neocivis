import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

export default function ForumScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text variant="heading">{t('forum.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
