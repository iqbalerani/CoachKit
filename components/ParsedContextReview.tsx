import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface ParsedContextReviewProps {
  visible: boolean;
  onClose: () => void;
  onSave: (context: Partial<UserContext>) => void;
  parsedContext: Partial<UserContext> | null;
  isLoading: boolean;
  accentColor?: string;
}

export default function ParsedContextReview({
  visible,
  onClose,
  onSave,
  parsedContext,
  isLoading,
  accentColor = COLORS.accent,
}: ParsedContextReviewProps) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [goal, setGoal] = useState('');
  const [role, setRole] = useState('');
  const [strengths, setStrengths] = useState('');
  const [struggles, setStruggles] = useState('');

  React.useEffect(() => {
    if (parsedContext) {
      setName(parsedContext.name || '');
      setFocus(parsedContext.currentFocus || '');
      setGoal(parsedContext.biggestGoal || '');
      setRole(parsedContext.role || '');
      setStrengths(parsedContext.strengths || '');
      setStruggles(parsedContext.struggles || '');
    }
  }, [parsedContext]);

  const handleSave = () => {
    const updates: Partial<UserContext> = {};
    if (name) updates.name = name;
    if (focus) updates.currentFocus = focus;
    if (goal) updates.biggestGoal = goal;
    if (role) updates.role = role;
    if (strengths) updates.strengths = strengths;
    if (struggles) updates.struggles = struggles;
    updates.importedFromNotion = true;
    onSave(updates);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Review Imported Context</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingText}>Parsing your Notion page...</Text>
            <Text style={styles.loadingSubtext}>AI is extracting your coaching context</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
              <Text style={styles.description}>
                Review and edit the extracted fields before saving to your profile.
              </Text>

              <Field label="Name" value={name} onChange={setName} />
              <Field label="Working on" value={focus} onChange={setFocus} multiline />
              <Field label="Biggest goal" value={goal} onChange={setGoal} multiline />
              <Field label="Role" value={role} onChange={setRole} />
              <Field label="Strengths" value={strengths} onChange={setStrengths} multiline />
              <Field label="Struggles" value={struggles} onChange={setStruggles} multiline />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: accentColor }]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.saveText}>Save to Profile</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: {
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  loadingSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  footer: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
  },
  saveText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
});
