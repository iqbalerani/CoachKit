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
import { Coach } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface ParsedCoachReviewProps {
  visible: boolean;
  onClose: () => void;
  onImport: (coachData: Partial<Coach>) => void;
  parsedCoach: Partial<Coach> | null;
  isLoading: boolean;
  accentColor?: string;
}

export default function ParsedCoachReview({
  visible,
  onClose,
  onImport,
  parsedCoach,
  isLoading,
  accentColor = COLORS.accent,
}: ParsedCoachReviewProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [personality, setPersonality] = useState('');
  const [tone, setTone] = useState('');
  const [category, setCategory] = useState('');

  React.useEffect(() => {
    if (parsedCoach) {
      setName(parsedCoach.name || '');
      setDescription(parsedCoach.description || '');
      setSystemPrompt(parsedCoach.systemPrompt || '');
      setPersonality(parsedCoach.personality || '');
      setTone(parsedCoach.tone || '');
      setCategory(parsedCoach.category || 'Custom');
    }
  }, [parsedCoach]);

  const handleImport = () => {
    onImport({
      name,
      description,
      systemPrompt,
      personality,
      tone,
      category: category || 'Custom',
      examplePrompts: parsedCoach?.examplePrompts || [],
      methodology: parsedCoach?.methodology || [],
      tags: parsedCoach?.tags || [],
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Review Imported Agent</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingText}>Parsing agent from Notion...</Text>
            <Text style={styles.loadingSubtext}>AI is extracting the agent profile</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
              <Text style={styles.description}>
                Review and edit the extracted agent profile before importing.
              </Text>

              <Field label="Agent Name" value={name} onChange={setName} />
              <Field label="Description" value={description} onChange={setDescription} multiline />
              <Field label="System Instructions" value={systemPrompt} onChange={setSystemPrompt} multiline large />
              <Field label="Personality" value={personality} onChange={setPersonality} />
              <Field label="Tone" value={tone} onChange={setTone} />
              <Field label="Category" value={category} onChange={setCategory} />

              {parsedCoach?.methodology && parsedCoach.methodology.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.fieldLabel}>Frameworks</Text>
                  <View style={styles.tagsRow}>
                    {parsedCoach.methodology.map((m, i) => (
                      <View key={i} style={[styles.tag, { borderColor: accentColor + '40' }]}>
                        <Text style={[styles.tagText, { color: accentColor }]}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {parsedCoach?.examplePrompts && parsedCoach.examplePrompts.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.fieldLabel}>Example Prompts</Text>
                  {parsedCoach.examplePrompts.map((p, i) => (
                    <Text key={i} style={styles.examplePrompt}>
                      {i + 1}. {p}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.importButton, { backgroundColor: accentColor }]}
                onPress={handleImport}
                disabled={!name.trim() || !systemPrompt.trim()}
              >
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.importText}>Import Agent</Text>
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
  large,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  large?: boolean;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[
          fieldStyles.input,
          multiline && fieldStyles.multiline,
          large && fieldStyles.large,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : undefined}
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
    paddingTop: 13,
  },
  large: {
    minHeight: 140,
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
  fieldLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tagsSection: {
    marginBottom: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  examplePrompt: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  footer: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
    opacity: 1,
  },
  importText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
});
