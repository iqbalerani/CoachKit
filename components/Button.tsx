import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, RADIUS } from '../constants/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  color,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const accentColor = color || COLORS.accent;

  const buttonStyles: ViewStyle[] = [styles.base];
  const textStyles: TextStyle[] = [styles.text];

  if (variant === 'primary') {
    buttonStyles.push({
      backgroundColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    });
    textStyles.push({ color: '#FFFFFF' });
  } else if (variant === 'secondary') {
    buttonStyles.push({ backgroundColor: COLORS.surface });
    textStyles.push({ color: accentColor });
  } else if (variant === 'outline') {
    buttonStyles.push({
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: accentColor,
    });
    textStyles.push({ color: accentColor });
  }

  if (disabled || loading) {
    buttonStyles.push({ opacity: 0.5 });
  }

  if (style) buttonStyles.push(style);
  if (textStyle) textStyles.push(textStyle);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : accentColor} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.button,
  },
});
