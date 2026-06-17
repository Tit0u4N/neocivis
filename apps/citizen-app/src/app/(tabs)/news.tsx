import { Newspaper } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { ArticleCard } from '@/components/article/ArticleCard';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useNewsList } from '@/screens/news/useNewsList';

export default function NewsScreen() {
  const { t } = useTranslation();
  const { articles, loading, loadingMore, error, hasMore, loadMore, navigateToArticle } = useNewsList();
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');

  return (
    <View style={styles.root}>
      <AppTopBar />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text variant="caption">{t('articles.error')}</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={() => {
                navigateToArticle(item.id);
              }}
            />
          )}
          ListHeaderComponent={
            <Text variant="heading" style={styles.heading}>
              {t('news.title')}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Newspaper size={48} color={mutedColor} strokeWidth={1.2} />
              <Text variant="caption" style={styles.emptyText}>
                {t('articles.empty')}
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <Button variant="ghost" loading={loadingMore} onPress={loadMore} style={styles.loadMoreBtn}>
                <Text>{loadingMore ? t('articles.loading') : t('articles.loadMore')}</Text>
              </Button>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginBottom: 16,
  },
  list: {
    padding: 16,
    gap: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 48,
  },
  emptyText: {
    textAlign: 'center',
  },
  loadMoreBtn: {
    marginTop: 4,
    marginBottom: 16,
  },
});
