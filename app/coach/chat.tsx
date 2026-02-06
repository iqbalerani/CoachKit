import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCoaches } from '../../hooks/useCoaches';
import { useChat } from '../../hooks/useChat';
import { useSubscription } from '../../hooks/useSubscription';
import ChatBubble from '../../components/ChatBubble';
import ChatInput from '../../components/ChatInput';
import { Message } from '../../types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';
import { FREE_DAILY_LIMIT } from '../../constants/config';

export default function ChatScreen() {
  const { coachId, initialPrompt } = useLocalSearchParams<{
    coachId: string;
    initialPrompt?: string;
  }>();
  const router = useRouter();
  const { getCoachById } = useCoaches();
  const coach = getCoachById(coachId || '');
  const { messages, isLoading, sendMessage, loadSession, startNewSession } = useChat(coach);
  const { subscription, trackMessage, canSendMessage } = useSubscription();
  const flatListRef = useRef<FlatList<Message>>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (coachId && !initialized) {
      loadSession(coachId).then(() => {
        setInitialized(true);
      });
    }
  }, [coachId, initialized]);

  useEffect(() => {
    if (initialized && initialPrompt && messages.length === 0) {
      handleSend(initialPrompt);
    }
  }, [initialized]);

  const handleSend = async (text: string) => {
    if (!canSendMessage()) {
      router.push('/paywall/pro');
      return;
    }

    const allowed = await trackMessage();
    if (!allowed) {
      router.push('/paywall/pro');
      return;
    }

    await sendMessage(text);
  };

  const handleNewSession = () => {
    startNewSession();
  };

  const accentColor = coach?.color || COLORS.accent;
  const remaining = subscription.tier === 'free' ? FREE_DAILY_LIMIT - subscription.messagesToday : null;

  if (!coach) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Coach not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerIcon}>{coach.icon}</Text>
          <View>
            <Text style={styles.headerName}>{coach.name}</Text>
            <View style={styles.activeRow}>
              <View style={[styles.activeDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleNewSession} style={styles.newButton}>
          <Ionicons name="refresh" size={20} color={accentColor} />
          <Text style={[styles.newText, { color: accentColor }]}>New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatArea}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              coachIcon={coach.icon}
              accentColor={accentColor}
            />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{coach.icon}</Text>
              <Text style={styles.emptyTitle}>Start a session with {coach.name}</Text>
              <Text style={styles.emptyDesc}>
                Ask anything or tap one of the suggestions below
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingAvatar}>
                  <Text style={{ fontSize: 16 }}>{coach.icon}</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={accentColor} />
                </View>
              </View>
            ) : null
          }
        />

        {remaining !== null && (
          <View style={styles.counterBar}>
            <Text style={styles.counterText}>
              {remaining > 0
                ? `${subscription.messagesToday} of ${FREE_DAILY_LIMIT} free messages`
                : 'Daily limit reached'}
              {' · '}
              <Text
                style={styles.counterLink}
                onPress={() => router.push('/paywall/pro')}
              >
                Upgrade
              </Text>
            </Text>
          </View>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={isLoading || (remaining !== null && remaining <= 0)}
          accentColor={accentColor}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  newText: {
    ...TYPOGRAPHY.label,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  typingBubble: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterBar: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  counterText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  counterLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
