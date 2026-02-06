import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';

interface ChatBubbleProps {
  message: Message;
  coachIcon?: string;
  accentColor?: string;
}

export default function ChatBubble({ message, coachIcon, accentColor = COLORS.accent }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.coachContainer]}>
      {!isUser && coachIcon && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{coachIcon}</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: accentColor }]
            : styles.coachBubble,
        ]}
      >
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  coachContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  coachBubble: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userBubble: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginLeft: 'auto',
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  userText: {
    color: '#FFFFFF',
  },
});
