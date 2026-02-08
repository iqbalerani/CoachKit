import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEnrollments } from '../hooks/useEnrollments';
import CoachCard from './CoachCard';
import BrandHeader from './BrandHeader';
import { AnimatedPressable, StaggerList } from './animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';

interface EnrolledCoachesListProps {
  accentColor: string;
  libraryRoute?: string;
}

export default function EnrolledCoachesList({ accentColor, libraryRoute }: EnrolledCoachesListProps) {
  const router = useRouter();
  const { enrolledCoaches, isLoading, refresh } = useEnrollments();

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
        <Text style={styles.title}>My Coaches</Text>
        {isLoading ? null : enrolledCoaches.length > 0 ? (
          <View style={styles.coachesList}>
            <StaggerList staggerDelay={60}>
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
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No coaches enrolled</Text>
            <Text style={styles.emptyDesc}>
              Enroll in coaches from the Library to see them here
            </Text>
            <AnimatedPressable
              onPress={() => router.push(libraryRoute || '/(seeker)/coaches')}
            >
              <Text style={[styles.emptyLink, { color: accentColor }]}>Browse Library</Text>
            </AnimatedPressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  coachesList: {
    gap: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyLink: {
    ...TYPOGRAPHY.label,
    marginTop: SPACING.sm,
  },
});
