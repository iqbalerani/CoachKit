import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Coach } from '../types';
import CoachCard from './CoachCard';
import SwipeableCoachCard from './SwipeableCoachCard';
import { AnimatedPressable, FadeInView, StaggerList } from './animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface CoachLibraryProps {
  builtInCoaches: Coach[];
  customCoaches: Coach[];
  accentColor?: string;
  onCoachPress: (coach: Coach) => void;
  onDeleteCoach?: (coachId: string) => void;
}

const CATEGORIES = ['All', 'Productivity', 'Strategy', 'Career', 'Creative', 'Mindset', 'Habits'];

export default function CoachLibrary({
  builtInCoaches,
  customCoaches,
  accentColor = COLORS.accent,
  onCoachPress,
  onDeleteCoach,
}: CoachLibraryProps) {
  const router = useRouter();
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
          <AnimatedPressable
            key={cat}
            style={[
              styles.filterPill,
              selectedCategory === cat && { backgroundColor: accentColor },
            ]}
            onPress={() => setSelectedCategory(cat)}
            scaleAmount={0.95}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextActive,
              ]}
            >
              {cat}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Built-in Coaches</Text>
      <StaggerList staggerDelay={60} baseDelay={100}>
        {filteredCoaches.map(coach => (
          <CoachCard
            key={coach.id}
            coach={coach}
            onPress={() => onCoachPress(coach)}
          />
        ))}
      </StaggerList>

      {customCoaches.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>My Coaches</Text>
          {customCoaches.map(coach => (
            onDeleteCoach ? (
              <SwipeableCoachCard
                key={coach.id}
                coach={coach}
                onPress={() => onCoachPress(coach)}
                onDelete={onDeleteCoach}
              />
            ) : (
              <CoachCard
                key={coach.id}
                coach={coach}
                onPress={() => onCoachPress(coach)}
              />
            )
          ))}
        </>
      )}

      <FadeInView delay={300}>
        <AnimatedPressable
          style={[styles.communityCard, { borderColor: accentColor + '30' }]}
          onPress={() => router.push('/marketplace')}
          scaleAmount={0.98}
        >
          <View style={[styles.communityIcon, { backgroundColor: accentColor + '15' }]}>
            <Ionicons name="globe-outline" size={24} color={accentColor} />
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityTitle}>Community Agents</Text>
            <Text style={styles.communityDesc}>
              Browse and import agents shared by the community
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </AnimatedPressable>
      </FadeInView>
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
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  communityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  communityDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
