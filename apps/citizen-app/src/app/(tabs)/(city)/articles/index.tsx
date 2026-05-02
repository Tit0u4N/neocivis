import { router, Stack } from 'expo-router';
import { Newspaper } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { ArticleCard } from '@/components/article/ArticleCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useArticlesList } from '@/screens/city/articles/useArticlesList';

export default function ArticlesListScreen() {
  const { t } = useTranslation();
  const { articles, loading, loadingMore, error, hasMore, loadMore } = useArticlesList();
  const primaryColor = useColor('primary');
  const mutedColor = useColor('textMuted');

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: t('articles.title') }} />
        <View style={styles.center}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: t('articles.title') }} />
        <View style={styles.center}>
          <Text variant="caption">{t('articles.error')}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('articles.title') }} />
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => {
              router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id: item.id } });
            }}
          />
        )}
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
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
