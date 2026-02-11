import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useCoaches } from '../../hooks/useCoaches';
import { useChat } from '../../hooks/useChat';
import { useSubscription } from '../../hooks/useSubscription';
import { useNotion } from '../../hooks/useNotion';
import { useUser } from '../../hooks/useUser';
import ChatBubble from '../../components/ChatBubble';
import ChatInput from '../../components/ChatInput';
import SessionSummaryCard from '../../components/SessionSummaryCard';
import NotionPagePicker from '../../components/NotionPagePicker';
import { AnimatedPressable, TypingDots } from '../../components/animated';
import { Message, SessionSummary, NotionPage } from '../../types';
import { generateSessionSummary } from '../../services/ai';
import { exportSessionToNotion } from '../../services/notion';
import { saveSession } from '../../services/storage';
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
  const { messages, isLoading, error, clearError, session, sendMessage, loadSession, startNewSession } = useChat(coach);
  const { subscription, trackMessage, canSendMessage } = useSubscription();
  const { isConnected } = useNotion();
  const { user } = useUser();
  const flatListRef = useRef<FlatList<Message>>(null);
  const [initialized, setInitialized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showContextBanner, setShowContextBanner] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showPagePicker, setShowPagePicker] = useState(false);

  // Menu dropdown animation
  const menuScale = useSharedValue(0.85);
  const menuOpacity = useSharedValue(0);

  useEffect(() => {
    if (showMenu) {
      menuScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      menuOpacity.value = withTiming(1, { duration: 200 });
    } else {
      menuScale.value = 0.85;
      menuOpacity.value = 0;
    }
  }, [showMenu]);

  const menuAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuScale.value }],
    opacity: menuOpacity.value,
  }));

  // Floating empty state icon
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500 }),
        withTiming(6, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

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

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Connection Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  // Restore summary from session
  useEffect(() => {
    if (session?.summary) {
      setSummary(session.summary);
    }
  }, [session?.summary]);

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
    setSummary(null);
    startNewSession();
  };

  const handleGenerateSummary = async () => {
    if (messages.length < 2) {
      Alert.alert('Not enough messages', 'Have a conversation first before generating a summary.');
      return;
    }

    setShowMenu(false);
    setIsGeneratingSummary(true);

    try {
      const raw = await generateSessionSummary(messages);
      const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const sessionSummary: SessionSummary = {
        ...parsed,
        id: `summary_${Date.now()}`,
        sessionId: session?.id,
        coachId: coachId,
        generatedAt: new Date().toISOString(),
      };
      setSummary(sessionSummary);

      // Save to session
      if (session) {
        const updated = { ...session, summary: sessionSummary };
        await saveSession(updated);
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      Alert.alert('Error', 'Failed to generate summary. Try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExportToNotion = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Connect Notion in your profile first.');
      return;
    }
    setShowMenu(false);
    setShowPagePicker(true);
  };

  const handleExportPageSelected = async (page: NotionPage) => {
    if (!summary || !coach) return;

    try {
      const result = await exportSessionToNotion(
        summary,
        { name: coach.name, icon: coach.icon },
        page.id
      );

      const updatedSummary: SessionSummary = {
        ...summary,
        exportedToNotion: true,
        notionPageId: result.pageId,
        notionPageUrl: result.url,
      };
      setSummary(updatedSummary);

      if (session) {
        await saveSession({ ...session, summary: updatedSummary });
      }

      Alert.alert('Exported!', 'Session summary exported to Notion.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export to Notion. Check your connection.');
    }
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
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </AnimatedPressable>
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
        <AnimatedPressable onPress={handleNewSession} style={styles.newButton}>
          <Ionicons name="refresh" size={20} color={accentColor} />
          <Text style={[styles.newText, { color: accentColor }]}>New</Text>
        </AnimatedPressable>
        <AnimatedPressable
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
        </AnimatedPressable>
      </View>

      {showMenu && (
        <Animated.View style={[styles.menuDropdown, menuAnimStyle]}>
          <AnimatedPressable
            style={styles.menuItem}
            onPress={handleGenerateSummary}
            disabled={isGeneratingSummary}
          >
            <Ionicons name="document-text-outline" size={18} color={COLORS.text} />
            <Text style={styles.menuItemText}>
              {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
            </Text>
          </AnimatedPressable>
          {isConnected && summary && (
            <AnimatedPressable
              style={styles.menuItem}
              onPress={handleExportToNotion}
            >
              <Text style={styles.menuNotionN}>N</Text>
              <Text style={styles.menuItemText}>Export to Notion</Text>
            </AnimatedPressable>
          )}
        </Animated.View>
      )}

      {showContextBanner && (user?.notionConnected || user?.importedFromNotion) && (
        <View style={styles.contextBanner}>
          <Text style={styles.contextBannerText}>
            {'\u{1F4CB}'} Using your Notion context
          </Text>
          <AnimatedPressable onPress={() => setShowContextBanner(false)} style={styles.contextBannerClose}>
            <Ionicons name="close" size={14} color={COLORS.textMuted} />
          </AnimatedPressable>
        </View>
      )}

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
              <Animated.View style={floatStyle}>
                <Text style={styles.emptyIcon}>{coach.icon}</Text>
              </Animated.View>
              <Text style={styles.emptyTitle}>Start a session with {coach.name}</Text>
              <Text style={styles.emptyDesc}>
                Ask anything or tap one of the suggestions below
              </Text>
            </View>
          }
          ListHeaderComponent={
            summary ? (
              <SessionSummaryCard
                summary={summary}
                onExportToNotion={handleExportToNotion}
                isNotionConnected={isConnected}
                accentColor={accentColor}
              />
            ) : null
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingAvatar}>
                  <Text style={{ fontSize: 16 }}>{coach.icon}</Text>
                </View>
                <View style={styles.typingBubble}>
                  <TypingDots color={accentColor} />
                </View>
              </View>
            ) : isGeneratingSummary ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingAvatar}>
                  <Ionicons name="document-text" size={16} color={accentColor} />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={accentColor} />
                  <Text style={styles.generatingText}>Generating summary...</Text>
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

      <NotionPagePicker
        visible={showPagePicker}
        onClose={() => setShowPagePicker(false)}
        onSelect={handleExportPageSelected}
        filter="page"
        title="Export Destination"
        accentColor={accentColor}
      />
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
  menuButton: {
    padding: SPACING.xs,
    marginLeft: 4,
  },
  menuDropdown: {
    position: 'absolute',
    top: 56,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 200,
    transformOrigin: 'top right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  menuNotionN: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    width: 18,
    textAlign: 'center',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.accentLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contextBannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  contextBannerClose: {
    position: 'absolute',
    right: SPACING.md,
    padding: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generatingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
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
