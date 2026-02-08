import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import Button from '../../components/Button';
import { FadeInView, StaggerList } from '../../components/animated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';

export default function Welcome() {
  const router = useRouter();

  // Logo animation
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  // Button shadow pulse
  const shadowOpacity = useSharedValue(0.3);

  useEffect(() => {
    shadowOpacity.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 }),
        ),
        -1,
      ),
    );
  }, []);

  const buttonGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <LinearGradient colors={['#0A0A0F', '#064E3B']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>C</Text>
            </View>
          </Animated.View>

          <FadeInView delay={200} direction="up">
            <Text style={styles.title}>CoachKit</Text>
          </FadeInView>

          <FadeInView delay={400} direction="up">
            <Text style={styles.tagline}>
              Your best life, simplified.{'\n'}Specialist AI agents powered by proven frameworks.
            </Text>
          </FadeInView>

          <View style={styles.pills}>
            <StaggerList baseDelay={600} staggerDelay={100}>
              {['🎯 Focused coaching', '🤖 AI-powered agents', '🔗 Share with anyone'].map(pill => (
                <View key={pill} style={styles.pill}>
                  <Text style={styles.pillText}>{pill}</Text>
                </View>
              ))}
            </StaggerList>
          </View>
        </View>

        <View style={styles.footer}>
          <FadeInView delay={900} direction="none">
            <Animated.View style={[styles.buttonGlow, buttonGlowStyle]}>
              <Button
                title="Get Started"
                onPress={() => router.push('/(onboarding)/intent')}
                color={COLORS.accent}
                style={{ width: '100%' }}
              />
            </Animated.View>
          </FadeInView>
          <FadeInView delay={1000} distance={10}>
            <Text style={styles.footerText}>
              No account needed · Data stays on your device
            </Text>
          </FadeInView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.accent,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 36,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    ...TYPOGRAPHY.label,
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  buttonGlow: {
    width: '100%',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.4)',
    marginTop: SPACING.md,
  },
});
