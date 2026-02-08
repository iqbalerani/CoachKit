import React, { useRef } from 'react';
import { View, Text, StyleSheet, Alert, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Coach } from '../types';
import CoachCard from './CoachCard';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';

interface SwipeableCoachCardProps {
  coach: Coach;
  onPress: () => void;
  onDelete: (coachId: string) => void;
}

export default function SwipeableCoachCard({ coach, onPress, onDelete }: SwipeableCoachCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete "${coach.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(coach.id),
        },
      ],
    );
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const opacity = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={styles.deleteAction} onPress={handleDelete}>
        <Animated.View style={[styles.deleteContent, { opacity }]}>
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
      >
        <CoachCard coach={coach} onPress={onPress} />
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sm,
  },
  deleteAction: {
    width: 80,
    backgroundColor: COLORS.error,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
