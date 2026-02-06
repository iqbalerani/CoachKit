import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../hooks/useUser';
import { useCoaches } from '../../hooks/useCoaches';
import Card from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function BuilderHome() {
  const router = useRouter();
  const { user } = useUser();
  const { customCoaches } = useCoaches();

  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.builderGradient} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>
                  {greeting}, {user?.name || 'there'}
                </Text>
                <Text style={styles.subGreeting}>Build AI agents that change lives</Text>
              </View>
              <View style={styles.creatorBadge}>
                <Text style={styles.creatorBadgeText}>CREATOR</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{customCoaches.length}</Text>
                <Text style={styles.statLabel}>Agents Built</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Link Opens</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/(builder)/create')}
          activeOpacity={0.7}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIcon}>
              <Ionicons name="add" size={28} color={COLORS.purple} />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Create New Agent</Text>
              <Text style={styles.ctaDesc}>Build a custom AI coaching agent</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>

        {customCoaches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Agents</Text>
            {customCoaches.map(coach => (
              <Card
                key={coach.id}
                onPress={() => router.push(`/coach/${coach.id}`)}
                style={{ marginBottom: SPACING.sm }}
              >
                <View style={styles.coachRow}>
                  <View style={[styles.coachIcon, { backgroundColor: coach.color + '15' }]}>
                    <Text style={{ fontSize: 20 }}>{coach.icon}</Text>
                  </View>
                  <View style={styles.coachInfo}>
                    <Text style={styles.coachName}>{coach.name}</Text>
                    <Text style={styles.coachDesc}>{coach.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </View>
              </Card>
            ))}
          </>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  creatorBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  creatorBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
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
  ctaCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purple + '30',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purple + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ctaTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
  },
  ctaDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  coachName: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    fontSize: 15,
  },
  coachDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
