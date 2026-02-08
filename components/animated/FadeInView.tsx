import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInViewProps {
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeInView({
  delay = 0,
  duration = 400,
  direction = 'up',
  distance = 20,
  style,
  children,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(direction === 'none' ? 0 : distance);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
    if (direction !== 'none') {
      translate.value = withDelay(delay, withTiming(0, { duration, easing }));
    }
  }, []);

  const isVertical = direction === 'up' || direction === 'down';
  const isHorizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'down' || direction === 'right' ? -1 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: isVertical
      ? [{ translateY: translate.value * sign }]
      : isHorizontal
        ? [{ translateX: translate.value * sign }]
        : [],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
