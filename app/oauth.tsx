import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exchangeCodeForToken } from '../services/notion';
import Button from '../components/Button';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';

const NOTION_REDIRECT_URI = 'https://iqbalerani.github.io/CoachKit/oauth/';

export default function OAuthCallback() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('No authorization code received.');
      return;
    }

    // On Android, the Chrome Custom Tab stays on top after the deep link fires.
    // Dismiss it so the user can see this screen.
    if (Platform.OS === 'android') {
      WebBrowser.dismissBrowser().catch(() => {});
    }

    exchangeCodeForToken(code, NOTION_REDIRECT_URI)
      .then(() => {
        router.replace('/');
      })
      .catch((err) => {
        console.error('OAuth token exchange failed:', err);
        setError('Failed to connect to Notion. Please try again.');
      });
  }, [code]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          <Button title="Go Home" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Connecting to Notion...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  errorDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
