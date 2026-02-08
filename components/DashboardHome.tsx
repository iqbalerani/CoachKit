import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useUser } from '../hooks/useUser';
import { useEnrollments } from '../hooks/useEnrollments';
import { useQuote } from '../hooks/useQuote';
import { useNotion } from '../hooks/useNotion';
import CoachCard from './CoachCard';
import BrandHeader from './BrandHeader';
import NotionConnectCard from './NotionConnectCard';
import { AnimatedPressable, FadeInView, StaggerList } from './animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface DashboardHomeProps {
  accentColor: string;
  showCreateLink: boolean;
}

export default function DashboardHome({ accentColor, showCreateLink }: DashboardHomeProps) {
  const router = useRouter();
  const { user } = useUser();
  const { enrolledCoaches, isLoading: enrollmentsLoading, refresh } = useEnrollments();
  const { quote, isLoading: quoteLoading, refreshQuote } = useQuote(enrolledCoaches);
  const { connection, isConnected, isConnecting, connect, disconnect } = useNotion();

  const greeting = getGreeting();

  // Refresh icon rotation
  const rotation = useSharedValue(0);
  const handleRefreshQuote = () => {
    rotation.value = withTiming(rotation.value + 360, { duration: 500 });
    refreshQuote();
  };
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
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

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={styles.container}>
      <BrandHeader />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.greeting}>
          {greeting}, {user?.name || 'there'}
        </Text>

        {/* Notion Connect Card (when disconnected) */}
        {!isConnected && (
          <View style={{ marginBottom: SPACING.lg }}>
            <NotionConnectCard
              connection={connection}
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </View>
        )}

        {/* AI Quote Card */}
        <FadeInView delay={100} direction="left" distance={30}>
          <View style={[styles.quoteCard, { borderLeftColor: accentColor }]}>
            <View style={styles.quoteContent}>
              {quoteLoading ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <Text style={styles.quoteText}>{quote}</Text>
              )}
            </View>
            <AnimatedPressable onPress={handleRefreshQuote} style={styles.quoteRefresh}>
              <Animated.View style={rotationStyle}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.textMuted} />
              </Animated.View>
            </AnimatedPressable>
          </View>
        </FadeInView>

        {/* Enrolled coaches */}
        <Text style={styles.sectionTitle}>Your Coaches</Text>

        {enrollmentsLoading ? (
          <ActivityIndicator size="small" color={accentColor} style={{ marginVertical: SPACING.lg }} />
        ) : enrolledCoaches.length > 0 ? (
          <View style={styles.coachesList}>
            <StaggerList staggerDelay={60} baseDelay={200}>
              {enrolledCoaches.map(coach => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  onPress={() => router.push(`/coach/${coach.id}`)}
                />
              ))}
            </StaggerList>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Animated.View style={floatStyle}>
              <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No coaches enrolled yet</Text>
            <AnimatedPressable onPress={() => router.push(showCreateLink ? '/(builder)/library' : '/(seeker)/coaches')}>
              <Text style={[styles.emptyLink, { color: accentColor }]}>Browse the Library</Text>
            </AnimatedPressable>
          </View>
        )}

        {/* Subtle create link (builder only) */}
        {showCreateLink && (
          <AnimatedPressable
            style={styles.createLink}
            onPress={() => router.push('/(builder)/create')}
          >
            <Ionicons name="add" size={18} color={COLORS.accent} />
            <Text style={styles.createLinkText}>Create Agent</Text>
          </AnimatedPressable>
        )}
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  // Quote card
  quoteCard: {
    backgroundColor: COLORS.quoteCardBg,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quoteContent: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  quoteText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  quoteRefresh: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  // Coaches section
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  coachesList: {
    gap: SPACING.sm,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  emptyLink: {
    ...TYPOGRAPHY.label,
    marginTop: SPACING.xs,
  },
  // Create link
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  createLinkText: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
  },
});
