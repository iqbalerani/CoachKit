import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NotionSyncState } from '../types';
import { getNotionSyncState, saveNotionSyncState } from '../services/storage';
import { getNotionConnection, readNotionPage, parseNotionContext } from '../services/notion';
import { useUser } from './useUser';

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useNotionSync() {
  const { user, updateUser } = useUser();
  const [syncState, setSyncState] = useState<NotionSyncState>({ isSyncing: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'error' | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    getNotionSyncState().then(setSyncState);
  }, []);

  const performSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);

    const newState: NotionSyncState = { ...syncState, isSyncing: true };
    setSyncState(newState);
    await saveNotionSyncState(newState);

    try {
      const conn = await getNotionConnection();
      if (!conn) throw new Error('Not connected');

      const pageId = user?.notionSourcePageId || syncState.contextPageId;
      if (!pageId) throw new Error('No source page configured');

      const content = await readNotionPage(pageId);
      const parsed = await parseNotionContext(content);

      if (parsed.currentFocus || parsed.biggestGoal || parsed.role) {
        await updateUser({
          ...parsed,
          notionLastSyncAt: new Date().toISOString(),
        });
      }

      const successState: NotionSyncState = {
        ...syncState,
        isSyncing: false,
        lastSyncAt: new Date().toISOString(),
        lastSyncResult: 'success',
        lastSyncError: undefined,
      };
      setSyncState(successState);
      await saveNotionSyncState(successState);
      setLastSyncResult('success');
    } catch (error: any) {
      const errorState: NotionSyncState = {
        ...syncState,
        isSyncing: false,
        lastSyncResult: 'error',
        lastSyncError: error.message,
      };
      setSyncState(errorState);
      await saveNotionSyncState(errorState);
      setLastSyncResult('error');
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [syncState, user, updateUser]);

  // Auto-sync on app foreground
  useEffect(() => {
    const checkAndSync = async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      if (!user?.notionConnected || !user?.notionAutoSync) return;
      if (syncingRef.current) return;

      const lastSync = syncState.lastSyncAt;
      if (lastSync) {
        const elapsed = Date.now() - new Date(lastSync).getTime();
        if (elapsed < SYNC_INTERVAL_MS) return;
      }

      await performSync();
    };

    const subscription = AppState.addEventListener('change', checkAndSync);
    return () => subscription.remove();
  }, [user, syncState, performSync]);

  return {
    syncState,
    isSyncing,
    performSync,
    lastSyncResult,
  };
}
