import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircle, Newspaper } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, ScrollView, StyleSheet } from 'react-native';
import { PlateRenderer } from '@/components/article/PlateRenderer';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useArticleDetail } from '@/screens/city/articles/useArticleDetail';
import { BORDER_RADIUS } from '@/theme/globals';

function formatDate(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

function SkeletonBlock({ height, width, style }: { height: number; width?: number | string; style?: object }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 750, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: false }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          width: width ?? '100%',
          borderRadius: 8,
          backgroundColor: '#e0e0e0',
          opacity,
        },
        style,
      ]}
    />
  );
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { article, loading, error } = useArticleDetail(id);
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const mutedColor = useColor('textMuted');
  const borderColor = useColor('border');
  const redColor = useColor('red');

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
          <SkeletonBlock height={300} style={{ borderRadius: 0 }} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonMeta}>
              <SkeletonBlock height={22} width={48} style={{ borderRadius: 999 }} />
              <SkeletonBlock height={16} width={120} />
            </View>
            <SkeletonBlock height={30} />
            <SkeletonBlock height={30} width="70%" />
            <SkeletonBlock height={18} style={{ marginTop: 4 }} />
            <SkeletonBlock height={18} width="85%" />
          </View>
        </ScrollView>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.errorState}>
          <AlertCircle size={48} color={redColor} strokeWidth={1.5} />
          <Text variant="caption" style={{ color: mutedColor, textAlign: 'center' }}>
            {t('articles.notFound')}
          </Text>
        </View>
      </>
    );
  }

  const locale = article.translation.locale;
  const date = article.publishedAt ?? article.createdAt;
  const hasCover = !!article.coverImageUrl;

  return (
    <>
      <Stack.Screen options={{ title: article.translation.title }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scroll}>
        {hasCover ? (
          <View style={styles.coverContainer}>
            <Image source={{ uri: article.coverImageUrl! }} style={styles.cover} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.15)']}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ) : (
          <View style={[styles.noCoverHeader, { backgroundColor: `${primaryColor}14` }]}>
            <Newspaper size={48} color={primaryColor} strokeWidth={1.3} />
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.meta}>
            <View style={[styles.localeBadge, { backgroundColor: primaryColor }]}>
              <Text style={[styles.localeText, { color: primaryFgColor }]}>{locale.toUpperCase()}</Text>
            </View>
            <Text variant="caption" style={{ color: mutedColor }}>
              {formatDate(date, locale)}
            </Text>
          </View>

          <Text variant="title" style={styles.title}>
            {article.translation.title}
          </Text>

          {article.translation.description ? (
            <Text variant="caption" style={[styles.description, { color: mutedColor }]}>
              {article.translation.description}
            </Text>
          ) : null}

          <View style={[styles.divider, { borderBottomColor: borderColor }]} />
        </View>

        <View style={styles.content}>
          <PlateRenderer content={article.translation.content} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  coverContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  cover: {
    width: '100%',
    height: 300,
  },
  noCoverHeader: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  header: {
    padding: 20,
    gap: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  localeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  localeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    lineHeight: 34,
  },
  description: {
    lineHeight: 22,
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  skeletonContent: {
    padding: 20,
    gap: 12,
  },
  skeletonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
});
