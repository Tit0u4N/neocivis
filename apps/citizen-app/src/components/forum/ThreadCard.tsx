import type { UserPublicDto } from '@repo/contracts';
import type { ThreadCategory, ThreadSummary } from '@repo/contracts/thread';
import { MessageCircle, ThumbsUp, User } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useRelativeDate } from '@/hooks/useRelativeDate';
import { BORDER_RADIUS } from '@/theme/globals';

interface ThreadCardProps {
  thread: ThreadSummary;
  category?: ThreadCategory;
  author?: UserPublicDto;
  onPress: () => void;
}

export function ThreadCard({ thread, category, author, onPress }: ThreadCardProps) {
  const cardBg = useColor('card');
  const borderColor = useColor('border');
  const mutedColor = useColor('textMuted');
  const primaryColor = useColor('primary');
  const relativeDate = useRelativeDate();

  const authorLabel = author ? `${author.firstName} ${author.lastName}` : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        {category && (
          <View style={[styles.categoryBadge, { backgroundColor: `${primaryColor}1A` }]}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[styles.categoryLabel, { color: primaryColor }]}>{category.label}</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.title}>
          {thread.title}
        </Text>
        {thread.body ? (
          <Text numberOfLines={2} style={[styles.body, { color: mutedColor }]}>
            {thread.body}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <View style={styles.authorRow}>
            {authorLabel ? (
              <>
                <User size={11} color={mutedColor} strokeWidth={1.5} />
                <Text style={[styles.authorText, { color: mutedColor }]}>{authorLabel}</Text>
                <Text style={[styles.separator, { color: mutedColor }]}>·</Text>
              </>
            ) : null}
            <Text style={[styles.date, { color: mutedColor }]}>{relativeDate(thread.createdAt)}</Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <ThumbsUp size={13} color={mutedColor} strokeWidth={1.5} />
              <Text style={[styles.statText, { color: mutedColor }]}>{thread.likes}</Text>
            </View>
            <View style={styles.stat}>
              <MessageCircle size={13} color={mutedColor} strokeWidth={1.5} />
              <Text style={[styles.statText, { color: mutedColor }]}>{thread.replyCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  separator: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
