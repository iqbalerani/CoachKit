import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import RevenueCatUI from 'react-native-purchases-ui';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { restorePurchases } from '../services/revenuecat';
import { AnimatedPressable } from '../components/animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const { session, signOut } = useAuth();
  const { subscription, refresh } = useSubscription();
  const [focus, setFocus] = useState(user?.currentFocus || '');
  const [goal, setGoal] = useState(user?.biggestGoal || '');
  const [role, setRole] = useState(user?.role || '');
  const [strengths, setStrengths] = useState(user?.strengths || '');
  const [struggles, setStruggles] = useState(user?.struggles || '');

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
      setStrengths(user.strengths || '');
      setStruggles(user.struggles || '');
    }
  }, [user]);

  const handleSave = (field: string, value: string) => {
    updateUser({ [field]: value });
  };

  const tierLabel = subscription.tier === 'free' ? 'Free' : 'Pro';

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
        {user?.importedFromNotion && (
          <Text style={styles.notionBadge}>Synced from Notion</Text>
        )}

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

        <View style={styles.field}>
          <Text style={styles.label}>Strengths</Text>
          <TextInput
            style={styles.input}
            value={strengths}
            onChangeText={setStrengths}
            onBlur={() => handleSave('strengths', strengths)}
            placeholder="What are you good at?"
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Struggles</Text>
          <TextInput
            style={styles.input}
            value={struggles}
            onChangeText={setStruggles}
            onBlur={() => handleSave('struggles', struggles)}
            placeholder="What do you struggle with?"
            placeholderTextColor={COLORS.textMuted}
            multiline
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

        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Subscription</Text>

        <AnimatedPressable
          style={styles.manageSubButton}
          onPress={async () => {
            await RevenueCatUI.presentCustomerCenter();
          }}
        >
          <Text style={styles.manageSubText}>Manage Subscription</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[styles.manageSubButton, { marginTop: SPACING.sm }]}
          onPress={async () => {
            try {
              await restorePurchases();
              await refresh();
              Alert.alert('Restored', 'Your purchases have been restored.');
            } catch {
              Alert.alert('Error', 'Could not restore purchases. Please try again.');
            }
          }}
        >
          <Text style={styles.manageSubText}>Restore Purchases</Text>
        </AnimatedPressable>

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
  notionBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginTop: -SPACING.xs,
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
  manageSubButton: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  manageSubText: {
    ...TYPOGRAPHY.button,
    color: COLORS.accent,
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
