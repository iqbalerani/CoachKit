import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/Button';
import { useUser } from '../../hooks/useUser';
import { UserContext } from '../../types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

type CoachingStyle = 'gentle' | 'balanced' | 'direct';

const styleOptions: { style: CoachingStyle; icon: string; title: string; desc: string }[] = [
  {
    style: 'gentle',
    icon: '🌱',
    title: 'Gentle',
    desc: 'Patient, encouraging. Guides you to your own answers.',
  },
  {
    style: 'balanced',
    icon: '⚖️',
    title: 'Balanced',
    desc: 'Warm but direct. Support with healthy challenge.',
  },
  {
    style: 'direct',
    icon: '⚡',
    title: 'Direct',
    desc: 'Straight to it. No fluff. Challenges assumptions.',
  },
];

export default function Style() {
  const router = useRouter();
  const { setUser } = useUser();
  const [selected, setSelected] = useState<CoachingStyle>('balanced');

  const handleStart = async () => {
    const userType = (await AsyncStorage.getItem('coachkit_onboarding_type')) as 'seeker' | 'builder' | 'both' || 'seeker';
    const name = (await AsyncStorage.getItem('coachkit_onboarding_name')) || '';
    const focus = (await AsyncStorage.getItem('coachkit_onboarding_focus')) || '';
    const goal = (await AsyncStorage.getItem('coachkit_onboarding_goal')) || '';

    const user: UserContext = {
      name,
      currentFocus: focus,
      biggestGoal: goal,
      coachingStyle: selected,
      userType,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
    };

    await setUser(user);

    // Clean up temp onboarding data
    await AsyncStorage.multiRemove([
      'coachkit_onboarding_type',
      'coachkit_onboarding_name',
      'coachkit_onboarding_focus',
      'coachkit_onboarding_goal',
    ]);

    const route = userType === 'seeker' ? '/(seeker)' : '/(builder)';
    router.replace(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Coaching style</Text>
        <Text style={styles.subtitle}>How do you prefer to be coached?</Text>

        <View style={styles.options}>
          {styleOptions.map(opt => (
            <TouchableOpacity
              key={opt.style}
              style={[
                styles.optionCard,
                selected === opt.style && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(opt.style)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                {opt.style === 'balanced' && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
              <View style={styles.radio}>
                {selected === opt.style && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Start Coaching →"
          onPress={handleStart}
          style={{ width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  options: {
    gap: SPACING.md,
  },
  optionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: COLORS.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optionDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginLeft: 36,
  },
  radio: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
});
