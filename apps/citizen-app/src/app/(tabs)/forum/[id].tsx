import { useLocalSearchParams } from 'expo-router';
import { MessageCircle, Send, ThumbsUp, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useRelativeDate } from '@/hooks/useRelativeDate';
import { useThreadDetail } from '@/screens/forum/useThreadDetail';
import { BORDER_RADIUS, CORNERS, FONT_SIZE } from '@/theme/globals';

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { thread, loading, error, replyBody, setReplyBody, submitting, submitReply, resolveUser } = useThreadDetail(id);
  const relativeDate = useRelativeDate();

  const primaryColor = useColor('primary');
  const primaryFgColor = useColor('primaryForeground');
  const mutedColor = useColor('textMuted');
  const bgColor = useColor('background');
  const cardBg = useColor('card');
  const borderColor = useColor('border');
  const textColor = useColor('text');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={primaryColor} size="large" />
      </View>
    );
  }

  if (error || !thread) {
    return (
      <View style={styles.center}>
        <Text variant="caption">{t('forum.thread.error')}</Text>
      </View>
    );
  }

  const activeMessages = thread.messages.filter((m) => !m.deleted);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Thread header card */}
        <View style={[styles.threadCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={styles.threadTitle}>{thread.title}</Text>
          <Text style={[styles.threadBody, { color: mutedColor }]}>{thread.body}</Text>
          <View style={styles.threadMeta}>
            <View style={styles.authorRow}>
              <User size={11} color={mutedColor} strokeWidth={1.5} />
              <Text style={[styles.metaText, { color: mutedColor }]}>
                {(() => {
                  const u = resolveUser(thread.authorId);
                  return u ? `${u.firstName} ${u.lastName}` : `#${thread.authorId}`;
                })()}
              </Text>
              <Text style={[styles.metaText, { color: mutedColor }]}>·</Text>
              <Text style={[styles.metaText, { color: mutedColor }]}>{relativeDate(thread.createdAt)}</Text>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <ThumbsUp size={13} color={mutedColor} strokeWidth={1.5} />
                <Text style={[styles.statText, { color: mutedColor }]}>{thread.likes}</Text>
              </View>
              <View style={styles.stat}>
                <MessageCircle size={13} color={mutedColor} strokeWidth={1.5} />
                <Text style={[styles.statText, { color: mutedColor }]}>{activeMessages.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        {activeMessages.length > 0 && (
          <View style={styles.messagesSection}>
            <Text style={[styles.sectionLabel, { color: mutedColor }]}>
              {t('forum.thread.replies', { count: activeMessages.length })}
            </Text>
            {activeMessages.map((message) => {
              const msgAuthor = resolveUser(message.authorId);
              return (
                <View key={message.id} style={[styles.messageCard, { backgroundColor: cardBg, borderColor }]}>
                  <View style={styles.messageAuthorRow}>
                    <User size={11} color={mutedColor} strokeWidth={1.5} />
                    <Text style={[styles.messageAuthor, { color: mutedColor }]}>
                      {msgAuthor ? `${msgAuthor.firstName} ${msgAuthor.lastName}` : `#${message.authorId}`}
                    </Text>
                    <Text style={[styles.messageDate, { color: mutedColor }]}>· {relativeDate(message.createdAt)}</Text>
                  </View>
                  <Text style={[styles.messageBody, { color: textColor }]}>{message.body}</Text>
                </View>
              );
            })}
          </View>
        )}

        {activeMessages.length === 0 && (
          <View style={styles.emptyReplies}>
            <Text variant="caption">{t('forum.thread.noReplies')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Reply input */}
      <View style={[styles.replyBar, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
        <View style={[styles.replyInput, { backgroundColor: cardBg, borderColor }]}>
          <TextInput
            style={[styles.replyTextInput, { color: textColor }]}
            placeholder={t('forum.thread.replyPlaceholder')}
            placeholderTextColor={mutedColor}
            value={replyBody}
            onChangeText={setReplyBody}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: replyBody.trim() ? primaryColor : `${primaryColor}40`,
            },
          ]}
          onPress={submitReply}
          disabled={!replyBody.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={primaryFgColor} />
          ) : (
            <Send size={18} color={primaryFgColor} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 8,
  },
  threadCard: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  threadBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  threadMeta: {
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
  metaText: {
    fontSize: 12,
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
  messagesSection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  messageCard: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  messageAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBody: {
    fontSize: FONT_SIZE,
    lineHeight: 22,
  },
  messageDate: {
    fontSize: 12,
  },
  emptyReplies: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyInput: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  replyTextInput: {
    fontSize: FONT_SIZE,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: CORNERS,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
