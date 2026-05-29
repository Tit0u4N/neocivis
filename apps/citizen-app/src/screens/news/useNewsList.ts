import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useArticlesStore } from '@/stores/articles.store';

export function useNewsList() {
  const { articles, loading, loadingMore, error, hasMore, loadInitial, loadMore, refresh } = useArticlesStore();

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial]),
  );

  const navigateToArticle = (id: string) => {
    router.push({ pathname: '/(tabs)/(city)/articles/[id]', params: { id } });
  };

  return { articles, loading, loadingMore, error, hasMore, loadMore, refresh, navigateToArticle };
}
