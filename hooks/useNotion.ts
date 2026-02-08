import { useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {
  getNotionConnection,
  exchangeCodeForToken,
  deleteNotionConnection,
  getNotionOAuthUrl,
} from '../services/notion';
import { NotionConnection } from '../types';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_NOTION_CLIENT_ID || '';

export function useNotion() {
  const [connection, setConnection] = useState<NotionConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'coachkit', path: 'oauth' });

  useEffect(() => {
    getNotionConnection().then(conn => {
      setConnection(conn);
      setIsConnected(!!conn);
      setIsLoading(false);
    });
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const authUrl = getNotionOAuthUrl(redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          const conn = await exchangeCodeForToken(code, redirectUri);
          setConnection(conn);
          setIsConnected(true);
          return conn;
        }
      }
      return null;
    } catch (error) {
      console.error('Notion OAuth error:', error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [redirectUri]);

  const disconnect = useCallback(async () => {
    await deleteNotionConnection();
    setConnection(null);
    setIsConnected(false);
  }, []);

  return {
    connection,
    isConnected,
    isConnecting,
    isLoading,
    connect,
    disconnect,
  };
}
