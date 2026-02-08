import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCoaches } from '../../hooks/useCoaches';
import { useUser } from '../../hooks/useUser';
import { useNotion } from '../../hooks/useNotion';
import Button from '../../components/Button';
import NotionPagePicker from '../../components/NotionPagePicker';
import ParsedCoachReview from '../../components/ParsedCoachReview';
import { Coach, NotionPage } from '../../types';
import { readNotionPage, parseNotionCoachInstructions } from '../../services/notion';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

const EMOJI_OPTIONS = [
  ['🎯', '🧠', '💡', '🔥', '⭐', '🌟', '💪', '🎨'],
  ['📈', '🧭', '🛡️', '🎓', '🏆', '🌱', '⚡', '🔮'],
];

const TEMPLATE_STARTERS = [
  { label: 'Socratic questioner', value: 'Ask probing questions to help the user discover answers themselves. Never give direct advice — instead, guide through thoughtful questioning.' },
  { label: 'Direct advisor', value: 'Give clear, actionable advice. Be direct and practical. Focus on specific steps and measurable outcomes.' },
  { label: 'Empathetic listener', value: 'Lead with empathy and emotional intelligence. Acknowledge feelings before problem-solving. Create a safe space for reflection.' },
];

export default function CreateCoach() {
  const router = useRouter();
  const { addCoach } = useCoaches();
  const { user } = useUser();
  const { isConnected } = useNotion();
  const [step, setStep] = useState(0);
  const [showNotionPicker, setShowNotionPicker] = useState(false);
  const [showCoachReview, setShowCoachReview] = useState(false);
  const [parsedCoach, setParsedCoach] = useState<Partial<Coach> | null>(null);
  const [isParsingCoach, setIsParsingCoach] = useState(false);
  const [icon, setIcon] = useState('🎯');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [examplePrompt1, setExamplePrompt1] = useState('');
  const [examplePrompt2, setExamplePrompt2] = useState('');
  const [examplePrompt3, setExamplePrompt3] = useState('');
  const [shareEnabled, setShareEnabled] = useState(false);

  const canProceedStep0 = name.trim().length > 0;
  const canProceedStep1 = instructions.trim().length > 0;

  const handleImportFromNotion = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Connect Notion in your profile first.');
      return;
    }
    setShowNotionPicker(true);
  };

  const handleNotionPageSelected = async (page: NotionPage) => {
    setShowNotionPicker(false);
    setIsParsingCoach(true);
    setShowCoachReview(true);

    try {
      const content = await readNotionPage(page.id);
      const parsed = await parseNotionCoachInstructions(content);
      setParsedCoach({
        ...parsed,
        notionSourcePageId: page.id,
      });
    } catch (error) {
      console.error('Coach import error:', error);
      Alert.alert('Import Failed', 'Could not parse the Notion page. Try a different page.');
      setShowCoachReview(false);
    } finally {
      setIsParsingCoach(false);
    }
  };

  const handleCoachImported = (coachData: Partial<Coach>) => {
    // Pre-fill the form with imported data
    if (coachData.name) setName(coachData.name);
    if (coachData.description) setDescription(coachData.description);
    if (coachData.systemPrompt) setInstructions(coachData.systemPrompt);
    if (coachData.examplePrompts?.length) {
      if (coachData.examplePrompts[0]) setExamplePrompt1(coachData.examplePrompts[0]);
      if (coachData.examplePrompts[1]) setExamplePrompt2(coachData.examplePrompts[1]);
      if (coachData.examplePrompts[2]) setExamplePrompt3(coachData.examplePrompts[2]);
    }
    // Move to step 1 (personality) since identity is filled
    if (coachData.name) setStep(1);
  };

  const handleCreate = async () => {
    if (!name.trim() || !instructions.trim()) {
      Alert.alert('Missing fields', 'Please fill in the name and instructions.');
      return;
    }

    const examplePrompts = [examplePrompt1, examplePrompt2, examplePrompt3]
      .map(p => p.trim())
      .filter(Boolean);

    const coach: Coach = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      icon,
      description: description.trim() || `Custom agent by ${user?.name || 'you'}`,
      tagline: description.trim() || name.trim(),
      category: 'Custom',
      color: COLORS.accent,
      systemPrompt: instructions.trim(),
      examplePrompts,
      isCustom: true,
      isShared: shareEnabled,
      creatorName: user?.name,
      opens: 0,
      sessions: 0,
    };

    await addCoach(coach);
    Alert.alert('Agent Created!', `${coach.name} is ready to use.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i <= step && styles.stepDotActive,
            i < step && styles.stepDotCompleted,
          ]}
        />
      ))}
    </View>
  );

  const renderPreviewCard = () => (
    <View style={styles.previewCard}>
      <View style={[styles.previewIcon, { backgroundColor: COLORS.accent + '15', borderColor: COLORS.accent + '30' }]}>
        <Text style={styles.previewIconText}>{icon}</Text>
      </View>
      <View style={styles.previewInfo}>
        <Text style={styles.previewName} numberOfLines={1}>
          {name || 'Agent Name'}
        </Text>
        <Text style={styles.previewDesc} numberOfLines={1}>
          {description || 'Your custom agent'}
        </Text>
      </View>
    </View>
  );

  const renderStep0 = () => (
    <>
      <Text style={styles.stepTitle}>Identity</Text>
      <Text style={styles.stepDesc}>Give your agent a name and icon</Text>

      {isConnected && (
        <TouchableOpacity
          style={styles.notionImportButton}
          onPress={handleImportFromNotion}
        >
          <Text style={styles.notionN}>N</Text>
          <View style={styles.notionImportInfo}>
            <Text style={styles.notionImportTitle}>Import from Notion</Text>
            <Text style={styles.notionImportDesc}>Pull an agent profile from a Notion page</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {renderPreviewCard()}

      <Text style={styles.label}>Icon</Text>
      <View style={styles.emojiSection}>
        {EMOJI_OPTIONS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.emojiRow}>
            {row.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  icon === emoji && styles.emojiOptionSelected,
                ]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Coach"
          placeholderTextColor={COLORS.textMuted}
          maxLength={30}
        />
      </View>
    </>
  );

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Personality</Text>
      <Text style={styles.stepDesc}>Define how your agent thinks and responds</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Short description of what this agent does"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>System Instructions</Text>
          <Text style={styles.charCount}>{instructions.length}/2000</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={instructions}
          onChangeText={(t) => setInstructions(t.slice(0, 2000))}
          placeholder="What should this agent do? How should it behave?"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>Try a template:</Text>
        <View style={styles.templateRow}>
          {TEMPLATE_STARTERS.map(t => (
            <TouchableOpacity
              key={t.label}
              style={styles.templatePill}
              onPress={() => setInstructions(t.value)}
            >
              <Text style={styles.templateText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Example Prompts (optional)</Text>
        <TextInput
          style={[styles.input, { marginBottom: SPACING.sm }]}
          value={examplePrompt1}
          onChangeText={setExamplePrompt1}
          placeholder="e.g. Help me plan my morning routine"
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={[styles.input, { marginBottom: SPACING.sm }]}
          value={examplePrompt2}
          onChangeText={setExamplePrompt2}
          placeholder="e.g. What should I focus on today?"
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          value={examplePrompt3}
          onChangeText={setExamplePrompt3}
          placeholder="e.g. Review my weekly goals"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Review & Create</Text>
      <Text style={styles.stepDesc}>Everything look good?</Text>

      <View style={styles.reviewCard}>
        <View style={[styles.reviewIconContainer, { backgroundColor: COLORS.accent + '15' }]}>
          <Text style={styles.reviewIcon}>{icon}</Text>
        </View>
        <Text style={styles.reviewName}>{name}</Text>
        <Text style={styles.reviewDesc}>
          {description || `Custom agent by ${user?.name || 'you'}`}
        </Text>
        {instructions && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Instructions</Text>
            <Text style={styles.reviewValue} numberOfLines={3}>{instructions}</Text>
          </View>
        )}
        {(examplePrompt1 || examplePrompt2 || examplePrompt3) && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Example Prompts</Text>
            {[examplePrompt1, examplePrompt2, examplePrompt3].filter(Boolean).map((p, i) => (
              <Text key={i} style={styles.reviewPrompt}>• {p}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.shareRow}>
        <View style={styles.shareInfo}>
          <Text style={styles.shareTitle}>Share this agent</Text>
          <Text style={styles.shareDesc}>Anyone with the link can use it</Text>
        </View>
        <Switch
          value={shareEnabled}
          onValueChange={setShareEnabled}
          trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
          thumbColor={shareEnabled ? COLORS.accent : COLORS.textMuted}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => step > 0 ? setStep(step - 1) : router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Agent</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 2 ? (
          <Button
            title="Next"
            onPress={() => setStep(step + 1)}
            color={COLORS.accent}
            disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
            style={{ width: '100%' }}
          />
        ) : (
          <Button
            title="Create Agent"
            onPress={handleCreate}
            color={COLORS.accent}
            style={{ width: '100%' }}
          />
        )}
      </View>

      <NotionPagePicker
        visible={showNotionPicker}
        onClose={() => setShowNotionPicker(false)}
        onSelect={handleNotionPageSelected}
        filter="page"
        title="Select Agent Page"
        accentColor={COLORS.accent}
      />

      <ParsedCoachReview
        visible={showCoachReview}
        onClose={() => setShowCoachReview(false)}
        onImport={handleCoachImported}
        parsedCoach={parsedCoach}
        isLoading={isParsingCoach}
        accentColor={COLORS.accent}
      />
    </SafeAreaView>
  );
}

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
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.accent + '60',
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.accent,
    width: 8,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  stepTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  previewIconText: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  previewName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
  },
  previewDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  emojiSection: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  emojiText: {
    fontSize: 22,
  },
  field: {
    marginBottom: SPACING.md,
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
    minHeight: 140,
    paddingTop: 13,
  },
  helperText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  templatePill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  templateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  reviewIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  reviewIcon: {
    fontSize: 32,
  },
  reviewName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  reviewSection: {
    width: '100%',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  reviewValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  reviewPrompt: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    fontSize: 15,
  },
  shareDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notionImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  notionN: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    width: 32,
    textAlign: 'center',
  },
  notionImportInfo: {
    flex: 1,
  },
  notionImportTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
    fontSize: 14,
  },
  notionImportDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
});
