import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleAmount?: number;
  disabled?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

export default function AnimatedPressable({
  onPress,
  style,
  scaleAmount = 0.97,
  disabled = false,
  haptic = false,
  children,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const triggerPress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(scaleAmount, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    })
    .onEnd(() => {
      if (onPress) {
        runOnJS(triggerPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, animatedStyle, disabled && { opacity: 0.5 }]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
