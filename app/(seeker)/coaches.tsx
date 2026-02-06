import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoaches } from '../../hooks/useCoaches';
import CoachLibrary from '../../components/CoachLibrary';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';

export default function SeekerCoaches() {
  const router = useRouter();
  const { builtInCoaches, customCoaches } = useCoaches();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Coaches</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: SPACING.xl, gap: SPACING.sm }}>
        <CoachLibrary
          builtInCoaches={builtInCoaches}
          customCoaches={customCoaches}
          accentColor={COLORS.accent}
          onCoachPress={(coach) => router.push(`/coach/${coach.id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
});
