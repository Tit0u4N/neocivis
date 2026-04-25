import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { ArticleCard } from '@/components/article/ArticleCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useHomeScreen } from '@/screens/city/useHomeScreen';

export default function CityScreen() {
  const { t } = useTranslation();
  const { articles, loading, error } = useHomeScreen();
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
      <View style={styles.container}>
        <View style={[styles.welcome, { backgroundColor: `${primaryColor}10` }]}>
          <Text variant="title">{t('city.welcomeTitle')}</Text>
          <Text variant="caption" style={{ color: mutedColor }}>
            {t('city.welcomeSubtitle')}
          </Text>
        </View>

        <Text variant="subtitle">{t('articles.latest')}</Text>

        {loading ? (
          <Text variant="caption">{t('articles.loading')}</Text>
        ) : error ? (
          <Text variant="caption">{t('articles.error')}</Text>
        ) : articles.length === 0 ? (
          <Text variant="caption">{t('articles.empty')}</Text>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => {
                router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id: article.id } });
              }}
            />
          ))
        )}

        <Button
          variant="outline"
          label={t('articles.seeAll')}
          onPress={() => {
            router.push('/(tabs)/(city)/articles');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
  },
  welcome: {
    padding: 16,
    borderRadius: 12,
    gap: 6,
    marginBottom: 4,
  },
});
