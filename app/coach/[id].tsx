import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCoaches } from '../../hooks/useCoaches';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCoachById } = useCoaches();

  const coach = getCoachById(id || '');

  if (!coach) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Coach not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[coach.color + 'DD', coach.color]}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconRing}>
                <Text style={styles.icon}>{coach.icon}</Text>
              </View>
            </View>
            <Text style={styles.name}>{coach.name}</Text>
            <View style={styles.agentBadge}>
              <Text style={styles.agentBadgeText}>Specialist Agent</Text>
            </View>
            <Text style={styles.tagline}>{coach.tagline}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{coach.sessions || 0}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{coach.category}</Text>
                <Text style={styles.statLabel}>Category</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={{ marginBottom: SPACING.lg }}>
          <Text style={styles.aboutText}>{coach.description}</Text>
        </Card>

        {coach.methodology && coach.methodology.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Frameworks</Text>
            <View style={styles.methodologyRow}>
              {coach.methodology.map((m, i) => (
                <View key={i} style={[styles.methodologyPill, { borderColor: coach.color + '40' }]}>
                  <Text style={[styles.methodologyText, { color: coach.color }]}>{m}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {coach.examplePrompts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Try asking</Text>
            {coach.examplePrompts.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.promptCard}
                onPress={() =>
                  router.push({
                    pathname: '/coach/chat',
                    params: { coachId: coach.id, initialPrompt: prompt },
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.promptText}>{prompt}</Text>
                <Ionicons name="arrow-forward" size={16} color={coach.color} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
          <Button
            title={`Start Session with ${coach.name}`}
            onPress={() =>
              router.push({ pathname: '/coach/chat', params: { coachId: coach.id } })
            }
            color={coach.color}
            style={{ width: '100%' }}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    gap: SPACING.md,
  },
  notFoundText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  hero: {
    paddingBottom: SPACING.xl,
  },
  heroHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 42,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  agentBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  agentBadgeText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
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
    paddingBottom: 100,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  aboutText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  methodologyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  methodologyPill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  methodologyText: {
    ...TYPOGRAPHY.label,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
