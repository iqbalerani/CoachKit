import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AnimatedPressable } from './animated';
import { COLORS } from '../constants/colors';
import { RADIUS, SPACING } from '../constants/typography';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function Card({ children, style, onPress }: CardProps) {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleAmount={0.98}>
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
