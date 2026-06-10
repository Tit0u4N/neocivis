import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThreadCard } from '@/components/forum/ThreadCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useForumList } from '@/screens/forum/useForumList';
import { CORNERS } from '@/theme/globals';

export default function ForumListScreen() {
  const { t } = useTranslation();
  const {
    categories,
    threads,
    selectedCategoryId,
    selectCategory,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    resolveUser,
  } = useForumList();
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const mutedColor = useColor('textMuted');
  const mutedBgColor = useColor('muted');
  const borderColor = useColor('border');

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={primaryColor} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="caption">{t('forum.error')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={[styles.categoriesRow, { borderBottomColor: borderColor }]}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: selectedCategoryId === undefined ? primaryColor : mutedBgColor,
              },
            ]}
            onPress={() => {
              selectCategory(undefined);
            }}
          >
            <Text style={[styles.chipText, { color: selectedCategoryId === undefined ? primaryFgColor : mutedColor }]}>
              {t('forum.allCategories')}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCategoryId === cat.id ? primaryColor : mutedBgColor,
                },
              ]}
              onPress={() => {
                selectCategory(cat.id);
              }}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.chipText, { color: selectedCategoryId === cat.id ? primaryFgColor : mutedColor }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThreadCard
            thread={item}
            category={item.categoryId ? getCategoryById(item.categoryId) : undefined}
            author={resolveUser(item.authorId)}
            onPress={() => {
              // biome-ignore lint/suspicious/noExplicitAny: typed routes not yet regenerated for new forum dir
              router.push({ pathname: '/forum/[id]' as any, params: { id: item.id } });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={mutedColor} strokeWidth={1.2} />
            <Text variant="caption" style={styles.emptyText}>
              {t('forum.empty')}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <Button variant="ghost" loading={loadingMore} onPress={loadMore} style={styles.loadMoreBtn}>
              <Text>{loadingMore ? t('forum.loading') : t('forum.loadMore')}</Text>
            </Button>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
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
  categoriesRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: CORNERS,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 16,
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
