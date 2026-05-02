import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useRelativeDate } from '@/hooks/useRelativeDate';

interface ArticlePreviewCardProps {
  article: ArticleWithResolvedTranslation;
  onPress: () => void;
}

export function ArticlePreviewCard({ article, onPress }: ArticlePreviewCardProps) {
  const cardBg = useColor('card');
  const borderColor = useColor('border');
  const mutedColor = useColor('textMuted');
  const secondaryBg = useColor('secondary');
  const relativeDate = useRelativeDate();

  const date = article.publishedAt ?? article.createdAt;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
    >
      {article.coverImageUrl ? (
        <Image source={{ uri: article.coverImageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, { backgroundColor: secondaryBg }]} />
      )}
      <View style={styles.content}>
        <Text style={[styles.meta, { color: mutedColor }]}>{`Actualités · ${relativeDate(date)}`}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {article.translation.title}
        </Text>
        {article.translation.description ? (
          <Text style={[styles.desc, { color: mutedColor }]} numberOfLines={2}>
            {article.translation.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 10,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
    paddingVertical: 2,
  },
  meta: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
