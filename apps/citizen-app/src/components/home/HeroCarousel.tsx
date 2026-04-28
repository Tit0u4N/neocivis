import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useHeroCarousel } from './useHeroCarousel';

export interface CarouselItem {
  id: string;
  imageUrl?: string;
  onPress?: () => void;
  tag?: string;
  title?: string;
  description?: string;
}

interface HeroCarouselProps {
  items: CarouselItem[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const { activeIndex, goTo } = useHeroCarousel(items.length);
  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const textColor = useColor('text');

  if (items.length === 0) {
    return null;
  }

  const item = items[activeIndex] ?? items[0];
  const hasText = !!(item.tag || item.title || item.description);

  const inner = (
    <>
      {item.tag ? (
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      ) : null}
      {item.title ? (
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      ) : null}
      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </>
  );

  const card = (
    <Animated.View key={activeIndex} entering={FadeIn.duration(300)} style={styles.hero}>
      {item.imageUrl ? (
        <ImageBackground source={{ uri: item.imageUrl }} style={styles.image} imageStyle={styles.imageStyle}>
          {hasText ? (
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.gradient}>
              <View style={styles.content}>{inner}</View>
            </LinearGradient>
          ) : null}
        </ImageBackground>
      ) : (
        <View style={[styles.image, { backgroundColor: primaryColor }]}>
          {hasText ? (
            <View style={styles.content}>
              {item.tag ? (
                <View style={styles.tagPill}>
                  <Text style={[styles.tagText, { color: primaryColor }]}>{item.tag}</Text>
                </View>
              ) : null}
              {item.title ? (
                <Text style={[styles.title, { color: primaryFgColor }]} numberOfLines={2}>
                  {item.title}
                </Text>
              ) : null}
              {item.description ? (
                <Text style={[styles.desc, { color: `${primaryFgColor}CC` }]} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.wrapper}>
      {item.onPress ? (
        <TouchableOpacity activeOpacity={0.92} onPress={item.onPress}>
          {card}
        </TouchableOpacity>
      ) : (
        card
      )}

      {items.length > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((_, i) => (
            <TouchableOpacity
              key={`dot-${i}`}
              onPress={() => {
                goTo(i);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    width: i === activeIndex ? 16 : 6,
                    backgroundColor: i === activeIndex ? textColor : `${textColor}40`,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  hero: {
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 18,
  },
  gradient: {
    paddingTop: 48,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  content: {
    padding: 14,
    gap: 6,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#18171A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  desc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
