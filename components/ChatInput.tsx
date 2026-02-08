import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from './animated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, RADIUS, SPACING } from '../constants/typography';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  accentColor?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message...',
  accentColor = COLORS.accent,
}: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline
        maxLength={2000}
        editable={!disabled}
      />
      <AnimatedPressable
        style={[styles.sendButton, { backgroundColor: accentColor }]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        scaleAmount={0.85}
        haptic
      >
        <Ionicons
          name="arrow-up"
          size={20}
          color="#FFF"
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    maxHeight: 100,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});
