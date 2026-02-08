import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotion } from '../hooks/useNotion';
import { useNotionSync } from '../hooks/useNotionSync';
import { useUser } from '../hooks/useUser';
import { useCoaches } from '../hooks/useCoaches';
import { getSessions } from '../services/storage';
import { readNotionPage, parseNotionContext, parseNotionCoachInstructions } from '../services/notion';
import NotionConnectCard from './NotionConnectCard';
import NotionPagePicker from './NotionPagePicker';
import ParsedContextReview from './ParsedContextReview';
import ParsedCoachReview from './ParsedCoachReview';
import { AnimatedPressable } from './animated';
import { ChatSession, Coach, NotionPage, UserContext } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

export default function NotionHub() {
  const { connection, isConnected, isConnecting, connect, disconnect } = useNotion();
  const { syncState, isSyncing, performSync } = useNotionSync();
  const { user, updateUser } = useUser();
  const { addCoach } = useCoaches();

  // Page picker state
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [pagePickerMode, setPagePickerMode] = useState<'context' | 'coach' | 'change'>('context');

  // Context review
  const [showContextReview, setShowContextReview] = useState(false);
  const [parsedContext, setParsedContext] = useState<Partial<UserContext> | null>(null);
  const [isParsingContext, setIsParsingContext] = useState(false);

  // Coach review
  const [showCoachReview, setShowCoachReview] = useState(false);
  const [parsedCoach, setParsedCoach] = useState<Partial<Coach> | null>(null);
  const [isParsingCoach, setIsParsingCoach] = useState(false);

  // Exported sessions
  const [exportedSessions, setExportedSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (isConnected) {
      getSessions().then(sessions => {
        setExportedSessions(
          sessions.filter(s => s.summary?.exportedToNotion === true)
        );
      });
    }
  }, [isConnected]);

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
            await updateUser({ notionConnected: false });
          },
        },
      ]
    );
  };

  const openPagePicker = (mode: 'context' | 'coach' | 'change') => {
    setPagePickerMode(mode);
    setShowPagePicker(true);
  };

  const handlePageSelected = async (page: NotionPage) => {
    setShowPagePicker(false);

    if (pagePickerMode === 'coach') {
      setIsParsingCoach(true);
      setShowCoachReview(true);
      try {
        const content = await readNotionPage(page.id);
        const parsed = await parseNotionCoachInstructions(content);
        setParsedCoach({ ...parsed, notionSourcePageId: page.id });
      } catch (error) {
        console.error('Coach import error:', error);
        Alert.alert('Import Failed', 'Could not parse the Notion page.');
        setShowCoachReview(false);
      } finally {
        setIsParsingCoach(false);
      }
    } else {
      // context or change
      setIsParsingContext(true);
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
        Alert.alert('Import Failed', 'Could not parse the Notion page.');
        setShowContextReview(false);
      } finally {
        setIsParsingContext(false);
      }
    }
  };

  const handleSaveContext = async (context: Partial<UserContext>) => {
    await updateUser(context);
    Alert.alert('Context Updated', 'Your profile has been updated with Notion data.');
  };

  const handleCoachImported = async (coachData: Partial<Coach>) => {
    const coach: Coach = {
      id: `notion_${Date.now()}`,
      name: coachData.name || 'Notion Agent',
      icon: '📝',
      description: coachData.description || 'Imported from Notion',
      tagline: coachData.description || coachData.name || 'Notion Agent',
      category: coachData.category || 'Custom',
      color: COLORS.accent,
      systemPrompt: coachData.systemPrompt || '',
      examplePrompts: coachData.examplePrompts || [],
      isCustom: true,
      creatorName: user?.name,
      opens: 0,
      sessions: 0,
    };
    await addCoach(coach);
    Alert.alert('Agent Imported!', `${coach.name} is ready to use.`);
  };

  const toggleAutoSync = () => {
    updateUser({ notionAutoSync: !user?.notionAutoSync });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentInner}>
      {/* Connection Status */}
      <NotionConnectCard
        connection={connection}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {isConnected && (
        <>
          {/* Sync Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync Status</Text>
            <View style={styles.card}>
              <View style={styles.syncRow}>
                <View style={styles.syncInfo}>
                  {syncState.lastSyncAt ? (
                    <>
                      <View style={styles.syncStatusRow}>
                        <View style={[
                          styles.syncDot,
                          { backgroundColor: syncState.lastSyncResult === 'success' ? COLORS.success : COLORS.error },
                        ]} />
                        <Text style={styles.syncStatusText}>
                          {syncState.lastSyncResult === 'success' ? 'Last sync successful' : 'Last sync failed'}
                        </Text>
                      </View>
                      <Text style={styles.syncTime}>
                        {new Date(syncState.lastSyncAt).toLocaleString()}
                      </Text>
                      {syncState.lastSyncError && (
                        <Text style={styles.syncError}>{syncState.lastSyncError}</Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.syncStatusText}>No sync yet</Text>
                  )}
                </View>
                <AnimatedPressable
                  style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                  onPress={performSync}
                  disabled={isSyncing}
                >
                  <Ionicons name="sync-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.syncButtonText}>
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </AnimatedPressable>
              </View>

              <View style={styles.autoSyncRow}>
                <View style={styles.autoSyncInfo}>
                  <Text style={styles.autoSyncLabel}>Auto-sync</Text>
                  <Text style={styles.autoSyncDesc}>Sync when app opens (daily)</Text>
                </View>
                <Switch
                  value={user?.notionAutoSync || false}
                  onValueChange={toggleAutoSync}
                  trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
                  thumbColor={user?.notionAutoSync ? COLORS.accent : COLORS.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Connected Page */}
          {user?.notionSourcePageTitle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connected Page</Text>
              <View style={styles.card}>
                <View style={styles.pageRow}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.pageTitle} numberOfLines={1}>
                    {user.notionSourcePageTitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.changePageButton}
                  onPress={() => openPagePicker('change')}
                >
                  <Text style={styles.changePageText}>Change Page</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Import / Export Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => openPagePicker('context')}
            >
              <Ionicons name="download-outline" size={22} color={COLORS.accent} />
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Import Context from Notion</Text>
                <Text style={styles.actionDesc}>Pull goals, role, and context from a page</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => openPagePicker('coach')}
            >
              <Ionicons name="person-add-outline" size={22} color={COLORS.accent} />
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Import Agent from Notion</Text>
                <Text style={styles.actionDesc}>Create a coach from a Notion page</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Export History */}
          {exportedSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Export History</Text>
              {exportedSessions.map(session => (
                <View key={session.id} style={styles.exportCard}>
                  <View style={styles.exportInfo}>
                    <Text style={styles.exportTitle} numberOfLines={1}>
                      {session.summary?.summary?.slice(0, 50) || 'Session'}
                    </Text>
                    <Text style={styles.exportDate}>
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {session.summary?.notionPageUrl && (
                    <TouchableOpacity onPress={() => Linking.openURL(session.summary!.notionPageUrl!)}>
                      <Text style={styles.viewLink}>View in Notion</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Modals */}
      <NotionPagePicker
        visible={showPagePicker}
        onClose={() => setShowPagePicker(false)}
        onSelect={handlePageSelected}
        filter="page"
        title={pagePickerMode === 'coach' ? 'Select Agent Page' : 'Select Context Page'}
        accentColor={COLORS.accent}
      />

      <ParsedContextReview
        visible={showContextReview}
        onClose={() => setShowContextReview(false)}
        onSave={handleSaveContext}
        parsedContext={parsedContext}
        isLoading={isParsingContext}
        accentColor={COLORS.accent}
      />

      <ParsedCoachReview
        visible={showCoachReview}
        onClose={() => setShowCoachReview(false)}
        onImport={handleCoachImported}
        parsedCoach={parsedCoach}
        isLoading={isParsingCoach}
        accentColor={COLORS.accent}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Sync
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  syncInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncStatusText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  syncTime: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  syncError: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    marginTop: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    ...TYPOGRAPHY.label,
    color: '#FFFFFF',
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  autoSyncInfo: {
    flex: 1,
  },
  autoSyncLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
  },
  autoSyncDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Page
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pageTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    fontWeight: '600',
  },
  changePageButton: {
    alignSelf: 'flex-start',
  },
  changePageText: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
  },
  // Actions
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    fontSize: 14,
  },
  actionDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Export
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
  },
  exportDate: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewLink: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
  },
});
