import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useCoaches } from '../../hooks/useCoaches';
import { useNotion } from '../../hooks/useNotion';
import { useEnrollments } from '../../hooks/useEnrollments';
import Button from '../../components/Button';
import Card from '../../components/Card';
import NotionPagePicker from '../../components/NotionPagePicker';
import { AnimatedPressable, FadeInView, StaggerList } from '../../components/animated';
import { NotionPage } from '../../types';
import { exportCoachToNotion } from '../../services/notion';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCoachById, deleteCoach } = useCoaches();
  const { isConnected } = useNotion();
  const { isEnrolled, enroll, unenroll } = useEnrollments();
  const [showExportPicker, setShowExportPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const coach = getCoachById(id || '');
  const enrolled = coach ? isEnrolled(coach.id) : false;

  // Hero icon spring
  const heroScale = useSharedValue(0.8);
  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  // Enroll bounce
  const enrollScale = useSharedValue(1);
  useEffect(() => {
    enrollScale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 300 }),
      withSpring(1.0, { damping: 12, stiffness: 200 }),
    );
  }, [enrolled]);
  const enrollStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enrollScale.value }],
  }));

  const handleExportToNotion = async (page: NotionPage) => {
    if (!coach) return;
    setIsExporting(true);
    try {
      const result = await exportCoachToNotion(coach, page.id);
      Alert.alert(
        'Exported!',
        `${coach.name} has been exported to Notion.`,
        [
          { text: 'OK' },
          {
            text: 'Open in Notion',
            onPress: () => {
              if (result.url) Linking.openURL(result.url);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Coach export error:', error);
      Alert.alert('Export Failed', 'Could not export to Notion. Check your connection.');
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* Flat hero */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroHeader}>
            <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </AnimatedPressable>
            {coach.isCustom && (
              <AnimatedPressable
                onPress={() => {
                  Alert.alert(
                    'Delete Agent',
                    `Are you sure you want to delete "${coach.name}"? This cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          deleteCoach(coach.id);
                          router.back();
                        },
                      },
                    ],
                  );
                }}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              </AnimatedPressable>
            )}
          </View>
          <View style={styles.heroContent}>
            <View style={styles.iconContainer}>
              <Animated.View style={heroStyle}>
                <View style={[styles.iconRing, { backgroundColor: coach.color + '15', borderColor: coach.color + '30' }]}>
                  <Text style={styles.icon}>{coach.icon}</Text>
                </View>
              </Animated.View>
            </View>
            <FadeInView delay={200} direction="up">
              <Text style={styles.name}>{coach.name}</Text>
            </FadeInView>
            <FadeInView delay={300} direction="up">
              <View style={[styles.categoryBadge, { backgroundColor: coach.color + '15' }]}>
                <Text style={[styles.categoryBadgeText, { color: coach.color }]}>{coach.category}</Text>
              </View>
            </FadeInView>
            <FadeInView delay={400} direction="up">
              <Text style={styles.tagline}>{coach.tagline}</Text>
            </FadeInView>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <FadeInView direction="up" delay={500}>
          <Text style={styles.sectionTitle}>About</Text>
          <Card style={{ marginBottom: SPACING.lg }}>
            <Text style={styles.aboutText}>{coach.description}</Text>
          </Card>
        </FadeInView>

        {coach.methodology && coach.methodology.length > 0 && (
          <FadeInView direction="up" delay={500}>
            <Text style={styles.sectionTitle}>Frameworks</Text>
            <View style={styles.methodologyRow}>
              {coach.methodology.map((m, i) => (
                <View key={i} style={[styles.methodologyPill, { borderColor: coach.color + '40' }]}>
                  <Text style={[styles.methodologyText, { color: coach.color }]}>{m}</Text>
                </View>
              ))}
            </View>
          </FadeInView>
        )}

        {coach.examplePrompts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Try asking</Text>
            <StaggerList baseDelay={600} staggerDelay={80}>
              {coach.examplePrompts.map((prompt, i) => (
                <AnimatedPressable
                  key={i}
                  style={styles.promptCard}
                  onPress={() =>
                    router.push({
                      pathname: '/coach/chat',
                      params: { coachId: coach.id, initialPrompt: prompt },
                    })
                  }
                  scaleAmount={0.98}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                  <Ionicons name="arrow-forward" size={16} color={coach.color} />
                </AnimatedPressable>
              ))}
            </StaggerList>
          </>
        )}

        {coach.isCustom && isConnected && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Notion</Text>
            <AnimatedPressable
              style={[styles.exportNotionButton, { borderColor: coach.color + '40' }]}
              onPress={() => setShowExportPicker(true)}
              disabled={isExporting}
              scaleAmount={0.98}
            >
              <Text style={styles.exportNotionN}>N</Text>
              <Text style={[styles.exportNotionText, { color: coach.color }]}>
                {isExporting ? 'Exporting...' : 'Export to Notion'}
              </Text>
            </AnimatedPressable>
          </>
        )}
      </ScrollView>

      {/* Footer with Enroll + Start Session */}
      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
          <Animated.View style={[styles.footerButtons, enrollStyle]}>
            <Button
              title={enrolled ? 'Unenroll' : 'Enroll'}
              onPress={() => enrolled ? unenroll(coach.id) : enroll(coach.id)}
              variant="outline"
              color={enrolled ? COLORS.textMuted : coach.color}
              style={{ flex: 1 }}
            />
            <Button
              title="Start Session"
              onPress={() =>
                router.push({ pathname: '/coach/chat', params: { coachId: coach.id } })
              }
              color={coach.color}
              style={{ flex: 2 }}
            />
          </Animated.View>
        </SafeAreaView>
      </View>

      <NotionPagePicker
        visible={showExportPicker}
        onClose={() => setShowExportPicker(false)}
        onSelect={handleExportToNotion}
        filter="page"
        title="Export Destination"
        accentColor={coach.color}
      />
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
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    paddingBottom: SPACING.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 42,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingBottom: 120,
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
  exportNotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.card,
  },
  exportNotionN: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  exportNotionText: {
    ...TYPOGRAPHY.label,
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
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
