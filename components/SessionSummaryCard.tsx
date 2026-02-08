import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SessionSummary } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface SessionSummaryCardProps {
  summary: SessionSummary;
  onExportToNotion?: () => void;
  isNotionConnected?: boolean;
  accentColor?: string;
}

export default function SessionSummaryCard({
  summary,
  onExportToNotion,
  isNotionConnected,
  accentColor = COLORS.accent,
}: SessionSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={20} color={accentColor} />
        <Text style={styles.headerTitle}>
          {summary.title || 'Session Summary'}
        </Text>
      </View>

      <Text style={styles.summaryText}>{summary.summary}</Text>

      {summary.keyInsight && (
        <View style={[styles.insightBox, { borderLeftColor: accentColor }]}>
          <Text style={styles.insightLabel}>Key Insight</Text>
          <Text style={styles.insightText}>{summary.keyInsight}</Text>
        </View>
      )}

      {summary.actionItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Action Items</Text>
          {summary.actionItems.map((item, i) => (
            <View key={i} style={styles.actionItem}>
              <View style={[styles.checkbox, { borderColor: accentColor }]} />
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {summary.keyInsights && summary.keyInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Insights</Text>
          {summary.keyInsights.map((insight, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: accentColor }]}>*</Text>
              <Text style={styles.bulletText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {summary.frameworks && summary.frameworks.length > 0 && (
        <View style={styles.tagsRow}>
          {summary.frameworks.map((fw, i) => (
            <View key={i} style={[styles.tag, { borderColor: accentColor + '40' }]}>
              <Text style={[styles.tagText, { color: accentColor }]}>{fw}</Text>
            </View>
          ))}
        </View>
      )}

      {summary.followUp && (
        <View style={styles.followUpBox}>
          <Ionicons name="arrow-forward-circle" size={16} color={COLORS.textSecondary} />
          <Text style={styles.followUpText}>{summary.followUp}</Text>
        </View>
      )}

      {isNotionConnected && onExportToNotion && (
        <TouchableOpacity
          style={[styles.exportButton, { borderColor: accentColor + '40' }]}
          onPress={onExportToNotion}
        >
          <Text style={styles.notionN}>N</Text>
          <Text style={[styles.exportText, { color: accentColor }]}>
            {summary.exportedToNotion ? 'Exported to Notion' : 'Export to Notion'}
          </Text>
          {summary.exportedToNotion && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  summaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  insightBox: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 3,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  insightLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  insightText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    marginTop: 2,
  },
  actionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  bulletText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  followUpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  followUpText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  notionN: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  exportText: {
    ...TYPOGRAPHY.label,
  },
});
