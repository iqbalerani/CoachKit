import React, { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedTabIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size: number;
  color: string;
  focused: boolean;
}

export default function AnimatedTabIcon({
  name,
  size,
  color,
  focused,
}: AnimatedTabIconProps) {
  const scale = useSharedValue(1);
  const prevFocused = useRef(focused);

  useEffect(() => {
    if (focused && !prevFocused.current) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 12, stiffness: 400 }),
        withSpring(1.0, { damping: 10, stiffness: 200 }),
      );
    }
    prevFocused.current = focused;
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}
