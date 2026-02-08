import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCoaches } from '../../hooks/useCoaches';
import CoachLibrary from '../../components/CoachLibrary';
import BrandHeader from '../../components/BrandHeader';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';

export default function BuilderLibrary() {
  const router = useRouter();
  const { builtInCoaches, customCoaches, deleteCoach } = useCoaches();

  return (
    <View style={styles.container}>
      <BrandHeader />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: SPACING.xl, gap: SPACING.sm }}>
        <Text style={styles.title}>Library</Text>
        <CoachLibrary
          builtInCoaches={builtInCoaches}
          customCoaches={customCoaches}
          accentColor={COLORS.accent}
          onCoachPress={(coach) => router.push(`/coach/${coach.id}`)}
          onDeleteCoach={deleteCoach}
        />
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  content: {
    flex: 1,
  },
});
