import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ArticlePreviewCard } from '@/components/home/ArticlePreviewCard';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { type CarouselItem, HeroCarousel } from '@/components/home/HeroCarousel';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useHomeScreen } from '@/screens/city/useHomeScreen';

export default function CityScreen() {
  const { t } = useTranslation();
  const { heroArticles, previewArticles, loading, error, categories, user } = useHomeScreen();
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');
  const secondaryBg = useColor('secondary');

  const greeting = user?.given_name ? t('city.greetingNamed', { name: user.given_name }) : t('city.greeting');

  const heroItems: CarouselItem[] = heroArticles.map((article) => ({
    id: article.id,
    imageUrl: article.coverImageUrl,
    tag: 'Actualités',
    title: article.translation.title,
    description: article.translation.description,
    onPress: () => {
      router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id: article.id } });
    },
  }));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Greeting */}
        <Text style={[styles.greeting, { color: mutedColor }]}>{greeting}</Text>

        {/* Hero carousel */}
        {loading ? (
          <View style={[styles.heroPlaceholder, { backgroundColor: secondaryBg }]}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : (
          <HeroCarousel items={heroItems} />
        )}

        {/* Categories */}
        <View>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('city.categories')}</Text>
          </View>
          <CategoryGrid categories={categories} />
        </View>

        {/* Articles preview */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('city.news')}</Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/(tabs)/(city)/articles');
              }}
            >
              <Text style={[styles.seeAll, { color: mutedColor }]}>{t('city.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={primaryColor} style={styles.listLoader} />
          ) : error ? (
            <Text variant="caption">{t('articles.error')}</Text>
          ) : previewArticles.length === 0 ? (
            <Text variant="caption">{t('articles.empty')}</Text>
          ) : (
            <View style={styles.articleList}>
              {previewArticles.map((article) => (
                <ArticlePreviewCard
                  key={article.id}
                  article={article}
                  onPress={() => {
                    router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id: article.id } });
                  }}
                />
              ))}
            </View>
          )}
        </View>
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
    paddingBottom: 32,
    gap: 20,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroPlaceholder: {
    height: 180,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  newsSection: {
    paddingBottom: 8,
  },
  listLoader: {
    marginTop: 12,
  },
  articleList: {
    gap: 12,
  },
});
