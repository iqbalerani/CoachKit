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

  // HTTPS URL that matches the Notion integration's redirect URI setting
  const notionRedirectUri = 'https://iqbalerani.github.io/CoachKit/oauth/';

  // Custom scheme URI — used by openAuthSessionAsync to detect the callback.
  // On iOS, ASWebAuthenticationSession handles this natively.
  // On Android, the Chrome Custom Tab opens the GitHub Pages intermediary,
  // which fires a deep link back to the app. app/oauth.tsx handles the token
  // exchange and dismisses the Custom Tab.
  const appRedirectUri = AuthSession.makeRedirectUri({ scheme: 'coachkit', path: 'oauth' });

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
      const authUrl = getNotionOAuthUrl(notionRedirectUri);

      // iOS: ASWebAuthenticationSession handles the custom scheme redirect natively
      // and returns the URL with the code.
      // Android: openAuthSessionAsync resolves with 'dismiss' after app/oauth.tsx
      // closes the Custom Tab. The connection is already saved by oauth.tsx.
      const result = await WebBrowser.openAuthSessionAsync(authUrl, appRedirectUri);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          const conn = await exchangeCodeForToken(code, notionRedirectUri);
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
  }, [notionRedirectUri, appRedirectUri]);

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
