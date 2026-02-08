import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Button from '../../components/Button';
import { AnimatedPressable, AnimatedProgressBar, StaggerList } from '../../components/animated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

type UserType = 'seeker' | 'builder' | 'both';

const options: { type: UserType; icon: string; title: string; desc: string; badge?: string }[] = [
  {
    type: 'seeker',
    icon: '🧭',
    title: 'Get coached',
    desc: 'Access specialist AI agents for focus, strategy, career, and mindset.',
    badge: 'MOST POPULAR',
  },
  {
    type: 'builder',
    icon: '🛠️',
    title: 'Build agents',
    desc: 'Create and share custom AI coaching agents with your audience.',
  },
  {
    type: 'both',
    icon: '✨',
    title: 'Both',
    desc: 'Get coached AND build your own specialist agents.',
  },
];

function RadioDot({ selected }: { selected: boolean }) {
  const scale = useSharedValue(selected ? 1 : 0);
  scale.value = withSpring(selected ? 1 : 0, { damping: 15, stiffness: 300 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.radio}>
      <Animated.View style={[styles.radioInner, animatedStyle]} />
    </View>
  );
}

export default function Intent() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserType>('seeker');

  const handleContinue = async () => {
    await AsyncStorage.setItem('coachkit_onboarding_type', selected);
    router.push('/(onboarding)/context');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <AnimatedProgressBar progress={0.33} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What brings you here?</Text>

        <View style={styles.options}>
          <StaggerList baseDelay={200} staggerDelay={80}>
            {options.map(opt => (
              <AnimatedPressable
                key={opt.type}
                style={[
                  styles.optionCard,
                  selected === opt.type && styles.optionCardSelected,
                ]}
                onPress={() => setSelected(opt.type)}
                scaleAmount={0.98}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>{opt.title}</Text>
                    {opt.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{opt.badge}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
                <RadioDot selected={selected === opt.type} />
              </AnimatedPressable>
            ))}
          </StaggerList>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} style={{ width: '100%' }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  progressContainer: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
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
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
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
