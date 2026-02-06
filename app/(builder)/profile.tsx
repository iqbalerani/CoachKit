import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../hooks/useUser';
import { useSubscription } from '../../hooks/useSubscription';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function BuilderProfile() {
  const { user, updateUser } = useUser();
  const { subscription } = useSubscription();
  const [focus, setFocus] = useState(user?.currentFocus || '');
  const [goal, setGoal] = useState(user?.biggestGoal || '');
  const [role, setRole] = useState(user?.role || '');

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
      <LinearGradient colors={COLORS.builderGradient} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

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
            <TouchableOpacity
              key={style}
              style={[
                styles.stylePill,
                user?.coachingStyle === style && styles.stylePillActive,
              ]}
              onPress={() => updateUser({ coachingStyle: style })}
            >
              <Text
                style={[
                  styles.stylePillText,
                  user?.coachingStyle === style && styles.stylePillTextActive,
                ]}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
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
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tierText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
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
    backgroundColor: COLORS.purpleLight,
    borderColor: COLORS.purple,
  },
  stylePillText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  stylePillTextActive: {
    color: COLORS.purple,
  },
});
