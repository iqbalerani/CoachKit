import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Coach } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, RADIUS, SPACING } from '../constants/typography';

interface CoachCardProps {
  coach: Coach;
  onPress: () => void;
}

export default function CoachCard({ coach, onPress }: CoachCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconCircle, { backgroundColor: coach.color + '15', borderColor: coach.color + '30' }]}>
        <Text style={styles.icon}>{coach.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {coach.description}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});
