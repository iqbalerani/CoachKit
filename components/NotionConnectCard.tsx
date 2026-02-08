import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotionConnection } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface NotionConnectCardProps {
  connection: NotionConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  accentColor?: string;
}

export default function NotionConnectCard({
  connection,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  accentColor = COLORS.accent,
}: NotionConnectCardProps) {
  if (isConnected && connection) {
    return (
      <View style={styles.card}>
        <View style={styles.connectedHeader}>
          <View style={[styles.notionIcon, { backgroundColor: accentColor + '15' }]}>
            <Text style={styles.notionIconText}>N</Text>
          </View>
          <View style={styles.connectedInfo}>
            <Text style={styles.workspaceName}>{connection.workspaceName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </View>
        {connection.connectedAt && (
          <Text style={styles.syncTime}>
            Connected {new Date(connection.connectedAt).toLocaleDateString()}
          </Text>
        )}
        <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect}>
          <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.disconnectedContent}>
        <View style={[styles.notionIcon, { backgroundColor: COLORS.surface }]}>
          <Text style={styles.notionIconText}>N</Text>
        </View>
        <View style={styles.disconnectedInfo}>
          <Text style={styles.title}>Connect Notion</Text>
          <Text style={styles.description}>
            Import your context, coaching notes, and agent prompts from Notion
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: accentColor }]}
        onPress={onConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="link-outline" size={18} color="#FFFFFF" />
            <Text style={styles.connectText}>Connect</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  notionIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notionIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  connectedInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  workspaceName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
  },
  syncTime: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  disconnectText: {
    ...TYPOGRAPHY.label,
    color: COLORS.error,
  },
  disconnectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  disconnectedInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  connectText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
