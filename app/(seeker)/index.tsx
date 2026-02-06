import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../hooks/useUser';
import { useSubscription } from '../../hooks/useSubscription';
import Card from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { FREE_DAILY_LIMIT } from '../../constants/config';

const quickStarts = [
  { icon: '🎯', label: 'Focus', tagline: 'Do less, better', coachId: 'essentialist' },
  { icon: '♟️', label: 'Decide', tagline: 'Think clearly', coachId: 'strategist' },
  { icon: '🚀', label: 'Career', tagline: 'Level up', coachId: 'career' },
  { icon: '🧘', label: 'Mindset', tagline: 'Stay strong', coachId: 'mindset' },
];

export default function SeekerHome() {
  const router = useRouter();
  const { user } = useUser();
  const { subscription } = useSubscription();

  const greeting = getGreeting();
  const remaining = FREE_DAILY_LIMIT - subscription.messagesToday;

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.seekerGradient} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {greeting}, {user?.name || 'there'}
            </Text>
            <Text style={styles.subGreeting}>Ready for a coaching session?</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {subscription.messagesToday}/{FREE_DAILY_LIMIT}
                </Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>6</Text>
                <Text style={styles.statLabel}>Agents</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.sectionTitle}>Your Agents</Text>
        <View style={styles.quickStartGrid}>
          {quickStarts.map(item => (
            <TouchableOpacity
              key={item.coachId}
              style={styles.quickStartCard}
              onPress={() => router.push(`/coach/${item.coachId}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickStartIcon}>{item.icon}</Text>
              <Text style={styles.quickStartLabel}>{item.label}</Text>
              <Text style={styles.quickStartTagline}>{item.tagline}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {subscription.tier === 'free' && (
          <Card
            onPress={() => router.push('/paywall/pro')}
            style={styles.upgradeBanner}
          >
            <Text style={styles.upgradeText}>
              {remaining > 0
                ? `${remaining} message${remaining !== 1 ? 's' : ''} left today`
                : 'Daily limit reached'}
              {' · '}
              <Text style={styles.upgradeLink}>Upgrade to Pro</Text>
            </Text>
          </Card>
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
  header: {
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  greeting: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
  },
  subGreeting: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    fontSize: 20,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickStartGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickStartCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStartIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickStartLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
  },
  quickStartTagline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  upgradeBanner: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent + '30',
  },
  upgradeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
  },
  upgradeLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
