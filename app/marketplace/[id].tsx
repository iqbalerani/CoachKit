import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplace } from '../../hooks/useMarketplace';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { MarketplaceCoach } from '../../types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function MarketplaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { coaches, importCoach } = useMarketplace();
  const [isImporting, setIsImporting] = useState(false);

  const coach = coaches.find(c => c.id === id);

  const handleImport = async () => {
    if (!coach) return;
    setIsImporting(true);
    try {
      const local = await importCoach(coach);
      Alert.alert(
        'Added!',
        `${local.name} has been added to your coaches.`,
        [
          { text: 'Stay Here' },
          {
            text: 'Start Session',
            onPress: () => router.push({ pathname: '/coach/chat', params: { coachId: local.id } }),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to import this agent.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!coach) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Agent not found</Text>
          <Text style={styles.notFoundSubtext}>
            Browse the marketplace to find this agent
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
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
            <View style={styles.iconRing}>
              <Text style={styles.icon}>{coach.icon}</Text>
            </View>
            <Text style={styles.name}>{coach.name}</Text>
            <Text style={styles.authorBadge}>by {coach.authorName}</Text>
            <Text style={styles.description}>{coach.description}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{coach.downloads}</Text>
                <Text style={styles.statLabel}>Downloads</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{coach.category}</Text>
                <Text style={styles.statLabel}>Category</Text>
              </View>
              {coach.rating && (
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{coach.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
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

        {coach.tags && coach.tags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {coach.tags.map((tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {coach.personality && (
          <>
            <Text style={styles.sectionTitle}>Personality</Text>
            <Card style={{ marginBottom: SPACING.lg }}>
              <Text style={styles.infoText}>{coach.personality}</Text>
            </Card>
          </>
        )}

        {coach.tone && (
          <>
            <Text style={styles.sectionTitle}>Tone</Text>
            <Card style={{ marginBottom: SPACING.lg }}>
              <Text style={styles.infoText}>{coach.tone}</Text>
            </Card>
          </>
        )}

        {coach.examplePrompts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Example Prompts</Text>
            {coach.examplePrompts.map((prompt, i) => (
              <View key={i} style={styles.promptCard}>
                <Text style={styles.promptText}>{prompt}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
          <Button
            title={isImporting ? 'Adding...' : 'Add to My Coaches'}
            onPress={handleImport}
            color={coach.color}
            loading={isImporting}
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
    gap: SPACING.md,
  },
  notFoundText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  notFoundSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
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
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 42,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  authorBadge: {
    ...TYPOGRAPHY.label,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tagPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  promptCard: {
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
