import type { ArticleWithResolvedTranslation } from '@repo/contracts/article';
import { LinearGradient } from 'expo-linear-gradient';
import { Newspaper } from 'lucide-react-native';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS } from '@/theme/globals';

interface ArticleCardProps {
  article: ArticleWithResolvedTranslation;
  onPress: () => void;
}

function formatDate(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const cardBg = useColor('card');
  const borderColor = useColor('border');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');

  const date = article.publishedAt ?? article.createdAt;
  const locale = article.translation.locale;

  if (article.coverImageUrl) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.wrapper}>
        <ImageBackground
          source={{ uri: article.coverImageUrl }}
          style={styles.imageCard}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.gradient}>
            <View style={styles.overlayContent}>
              <View style={styles.metaRow}>
                <View style={styles.localeBadgeLight}>
                  <Text style={styles.localeBadgeLightText}>{locale.toUpperCase()}</Text>
                </View>
                <Text style={styles.dateOverlay}>{formatDate(date, locale)}</Text>
              </View>
              <Text style={styles.titleOverlay} numberOfLines={2}>
                {article.translation.title}
              </Text>
              {article.translation.description ? (
                <Text style={styles.descriptionOverlay} numberOfLines={2}>
                  {article.translation.description}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.noImagePlaceholder, { backgroundColor: `${primaryColor}14` }]}>
          <Newspaper size={36} color={primaryColor} strokeWidth={1.5} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.metaRow}>
            <View style={[styles.localeBadgeDark, { backgroundColor: primaryColor }]}>
              <Text style={[styles.localeBadgeDarkText, { color: primaryFgColor }]}>{locale.toUpperCase()}</Text>
            </View>
            <Text style={[styles.dateCard, { color: mutedColor }]}>{formatDate(date, locale)}</Text>
          </View>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {article.translation.title}
          </Text>
          {article.translation.description ? (
            <Text numberOfLines={2} style={[styles.cardDescription, { color: mutedColor }]}>
              {article.translation.description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  imageCard: {
    height: 220,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: BORDER_RADIUS,
  },
  gradient: {
    paddingTop: 60,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  overlayContent: {
    padding: 16,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  localeBadgeLight: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  localeBadgeLightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  dateOverlay: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  titleOverlay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
  },
  descriptionOverlay: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  card: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  noImagePlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  localeBadgeDark: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  localeBadgeDarkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateCard: {
    fontSize: 13,
  },
});
