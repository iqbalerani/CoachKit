import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/Button';
import { AnimatedProgressBar, StaggerList } from '../../components/animated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

export default function Context() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [goal, setGoal] = useState('');

  const handleContinue = async () => {
    await AsyncStorage.setItem('coachkit_onboarding_name', name);
    await AsyncStorage.setItem('coachkit_onboarding_focus', focus);
    await AsyncStorage.setItem('coachkit_onboarding_goal', goal);
    router.push('/(onboarding)/style');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <AnimatedProgressBar progress={0.66} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>About you</Text>
          <Text style={styles.subtitle}>
            Your coaches will use this to personalize every session.
          </Text>

          <StaggerList baseDelay={200} staggerDelay={100}>
            <View style={styles.field}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Sarah"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>What are you working on?</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={focus}
                onChangeText={setFocus}
                placeholder="e.g. Building a side project while working full-time"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Biggest goal this year</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={goal}
                onChangeText={setGoal}
                placeholder="e.g. Launch my app and get 100 users"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </StaggerList>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!name.trim()}
            style={{ width: '100%' }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  progressContainer: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
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
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
  multiline: {
    minHeight: 80,
    paddingTop: 13,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
});
