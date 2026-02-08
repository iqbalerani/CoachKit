import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketplaceCoach } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface MarketplaceCardProps {
  coach: MarketplaceCoach;
  onPreview: () => void;
  onAdd: () => void;
}

export default function MarketplaceCard({
  coach,
  onPreview,
  onAdd,
}: MarketplaceCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPreview}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: coach.color + '15', borderColor: coach.color + '30' }]}>
          <Text style={styles.icon}>{coach.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{coach.name}</Text>
          <Text style={styles.author}>by {coach.authorName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: coach.color }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={2}>{coach.description}</Text>

      <View style={styles.bottomRow}>
        <View style={[styles.categoryPill, { borderColor: coach.color + '40' }]}>
          <Text style={[styles.categoryText, { color: coach.color }]}>{coach.category}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="download-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.statText}>{coach.downloads}</Text>
        </View>
        {coach.rating && (
          <View style={styles.statRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.statText}>{coach.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  author: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
});
