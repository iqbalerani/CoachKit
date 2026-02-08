import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotion } from '../hooks/useNotion';
import { useUser } from '../hooks/useUser';
import { readNotionPage, parseNotionContext } from '../services/notion';
import NotionConnectCard from './NotionConnectCard';
import NotionPagePicker from './NotionPagePicker';
import ParsedContextReview from './ParsedContextReview';
import { NotionPage, UserContext } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface NotionProfileSectionProps {
  accentColor?: string;
}

export default function NotionProfileSection({
  accentColor = COLORS.accent,
}: NotionProfileSectionProps) {
  const { connection, isConnected, isConnecting, connect, disconnect } = useNotion();
  const { user, updateUser } = useUser();
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [showContextReview, setShowContextReview] = useState(false);
  const [parsedContext, setParsedContext] = useState<Partial<UserContext> | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleConnect = async () => {
    const result = await connect();
    if (result) {
      Alert.alert('Connected!', `Connected to ${result.workspaceName}`);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Notion?',
      'This will remove your Notion connection. Your imported data will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnect();
            await updateUser({
              notionConnected: false,
            });
          },
        },
      ]
    );
  };

  const handleImportContext = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Connect to Notion first to import your context.');
      return;
    }
    setShowPagePicker(true);
  };

  const handlePageSelected = async (page: NotionPage) => {
    setShowPagePicker(false);
    setIsParsing(true);
    setShowContextReview(true);

    try {
      const content = await readNotionPage(page.id);
      const parsed = await parseNotionContext(content);
      setParsedContext(parsed);

      await updateUser({
        notionConnected: true,
        notionSourcePageId: page.id,
        notionSourcePageTitle: page.title,
        notionLastSyncAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Context import error:', error);
      Alert.alert('Import Failed', 'Could not parse the Notion page. Try a different page.');
      setShowContextReview(false);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveContext = async (context: Partial<UserContext>) => {
    await updateUser(context);
    Alert.alert('Context Updated', 'Your profile has been updated with Notion data.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Notion Integration</Text>

      <NotionConnectCard
        connection={connection}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        accentColor={accentColor}
      />

      {isConnected && (
        <TouchableOpacity
          style={[styles.importButton, { borderColor: accentColor + '40' }]}
          onPress={handleImportContext}
        >
          <Ionicons name="download-outline" size={20} color={accentColor} />
          <View style={styles.importInfo}>
            <Text style={[styles.importTitle, { color: accentColor }]}>
              Import Context from Notion
            </Text>
            <Text style={styles.importDesc}>
              {user?.notionSourcePageTitle
                ? `Last imported from "${user.notionSourcePageTitle}"`
                : 'Pull your goals, role, and context from a Notion page'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      <NotionPagePicker
        visible={showPagePicker}
        onClose={() => setShowPagePicker(false)}
        onSelect={handlePageSelected}
        filter="page"
        title="Select Context Page"
        accentColor={accentColor}
      />

      <ParsedContextReview
        visible={showContextReview}
        onClose={() => setShowContextReview(false)}
        onSave={handleSaveContext}
        parsedContext={parsedContext}
        isLoading={isParsing}
        accentColor={accentColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  importInfo: {
    flex: 1,
  },
  importTitle: {
    ...TYPOGRAPHY.label,
    fontSize: 14,
  },
  importDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
