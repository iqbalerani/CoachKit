import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Coach } from '../types';
import CoachCard from './CoachCard';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { TouchableOpacity } from 'react-native';

interface CoachLibraryProps {
  builtInCoaches: Coach[];
  customCoaches: Coach[];
  accentColor?: string;
  onCoachPress: (coach: Coach) => void;
}

const CATEGORIES = ['All', 'Productivity', 'Strategy', 'Career', 'Creative', 'Mindset', 'Habits'];

export default function CoachLibrary({
  builtInCoaches,
  customCoaches,
  accentColor = COLORS.accent,
  onCoachPress,
}: CoachLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCoaches = selectedCategory === 'All'
    ? builtInCoaches
    : builtInCoaches.filter(c => c.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              selectedCategory === cat && { backgroundColor: accentColor },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Built-in Coaches</Text>
      {filteredCoaches.map(coach => (
        <CoachCard
          key={coach.id}
          coach={coach}
          onPress={() => onCoachPress(coach)}
        />
      ))}

      {customCoaches.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>My Coaches</Text>
          {customCoaches.map(coach => (
            <CoachCard
              key={coach.id}
              coach={coach}
              onPress={() => onCoachPress(coach)}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    maxHeight: 44,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
});
