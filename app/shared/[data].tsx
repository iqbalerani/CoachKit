import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseShareLink } from '../../utils/sharing';
import { useCoaches } from '../../hooks/useCoaches';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function SharedCoachImport() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const { addCoach } = useCoaches();

  const coach = data ? parseShareLink(data) : null;

  if (!coach) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Invalid Share Link</Text>
          <Text style={styles.errorDesc}>This coach link appears to be invalid or corrupted.</Text>
          <Button title="Go Home" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAdd = async () => {
    await addCoach(coach);
    Alert.alert(
      'Coach Added!',
      `${coach.name} has been added to your library.`,
      [{ text: 'Start Chatting', onPress: () => router.replace(`/coach/${coach.id}`) }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: coach.color + '15' }]}>
          <Text style={styles.icon}>{coach.icon}</Text>
        </View>

        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.description}>{coach.description}</Text>

        {coach.creatorName && (
          <Card style={styles.sharedByCard}>
            <View style={styles.sharedByRow}>
              <View style={styles.sharedByAvatar}>
                <Text style={styles.sharedByInitial}>
                  {coach.creatorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sharedByName}>{coach.creatorName}</Text>
                <Text style={styles.sharedByVia}>via CoachKit link</Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About this coach</Text>
          <Text style={styles.aboutText}>
            {coach.systemPrompt.substring(0, 200)}
            {coach.systemPrompt.length > 200 ? '...' : ''}
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title="Add to My Coaches"
          onPress={handleAdd}
          color={coach.color}
          style={{ width: '100%' }}
        />
        <Text style={styles.footerText}>Free to use · No account needed</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 40,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sharedByCard: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  sharedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sharedByAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedByInitial: {
    ...TYPOGRAPHY.h3,
    color: COLORS.accent,
  },
  sharedByName: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    fontSize: 15,
  },
  sharedByVia: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  aboutCard: {
    width: '100%',
  },
  aboutTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  errorDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
