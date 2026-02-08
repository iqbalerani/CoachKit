import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

interface TypingDotsProps {
  color?: string;
  dotSize?: number;
}

function Dot({ color, size, delay }: { color: string; size: number; delay: number }) {
  const scale = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(0.7, { duration: 300 }),
        ),
        -1,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function TypingDots({
  color = COLORS.textMuted,
  dotSize = 8,
}: TypingDotsProps) {
  return (
    <View style={styles.container}>
      <Dot color={color} size={dotSize} delay={0} />
      <Dot color={color} size={dotSize} delay={150} />
      <Dot color={color} size={dotSize} delay={300} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
});
