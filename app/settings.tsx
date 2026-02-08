import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { AnimatedPressable } from '../components/animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const { session, signOut } = useAuth();
  const { subscription } = useSubscription();
  const [focus, setFocus] = useState(user?.currentFocus || '');
  const [goal, setGoal] = useState(user?.biggestGoal || '');
  const [role, setRole] = useState(user?.role || '');

  // Avatar spring
  const avatarScale = useSharedValue(0.8);
  useEffect(() => {
    avatarScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  useEffect(() => {
    if (user) {
      setFocus(user.currentFocus);
      setGoal(user.biggestGoal);
      setRole(user.role || '');
    }
  }, [user]);

  const handleSave = (field: string, value: string) => {
    updateUser({ [field]: value });
  };

  const tierLabel = subscription.tier === 'free' ? 'Free' : subscription.tier === 'pro' ? 'Pro' : 'Creator';

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.avatar, avatarStyle]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </Animated.View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          {session?.email ? (
            <Text style={styles.emailText}>{session.email}</Text>
          ) : null}
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{tierLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.sectionTitle}>My Context</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Working on</Text>
          <TextInput
            style={styles.input}
            value={focus}
            onChangeText={setFocus}
            onBlur={() => handleSave('currentFocus', focus)}
            placeholder="What are you working on?"
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Biggest goal</Text>
          <TextInput
            style={styles.input}
            value={goal}
            onChangeText={setGoal}
            onBlur={() => handleSave('biggestGoal', goal)}
            placeholder="Your biggest goal"
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            onBlur={() => handleSave('role', role)}
            placeholder="e.g. Software Developer"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Coaching Style</Text>
        <View style={styles.styleRow}>
          {(['gentle', 'balanced', 'direct'] as const).map(style => (
            <AnimatedPressable
              key={style}
              style={[
                styles.stylePill,
                user?.coachingStyle === style && styles.stylePillActive,
              ]}
              onPress={() => updateUser({ coachingStyle: style })}
              scaleAmount={0.95}
            >
              <Text
                style={[
                  styles.stylePillText,
                  user?.coachingStyle === style && styles.stylePillTextActive,
                ]}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>

        <AnimatedPressable
          style={styles.signOutButton}
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  header: {
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent + '20',
    borderWidth: 2,
    borderColor: COLORS.accent + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.accent,
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tierBadge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tierText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  styleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stylePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  stylePillActive: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  stylePillText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  stylePillTextActive: {
    color: COLORS.accent,
  },
  emailText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  signOutButton: {
    marginTop: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  signOutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
  },
});
