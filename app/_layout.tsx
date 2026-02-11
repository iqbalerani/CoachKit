import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { UserProvider } from '../hooks/useUser';
import { CoachProvider } from '../hooks/useCoaches';
import { useNotionSync } from '../hooks/useNotionSync';
import { initializePurchases, loginUser } from '../services/revenuecat';

function NotionSyncProvider({ children }: { children: React.ReactNode }) {
  useNotionSync();
  return <>{children}</>;
}

function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  useEffect(() => {
    initializePurchases().catch(err => {
      console.error('Failed to initialize RevenueCat:', err);
    });
  }, []);

  useEffect(() => {
    if (session?.userId) {
      loginUser(session.userId);
    }
  }, [session?.userId]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RevenueCatProvider>
          <UserProvider>
            <CoachProvider>
              <NotionSyncProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(onboarding)" />
                  <Stack.Screen name="(seeker)" />
                  <Stack.Screen name="(builder)" />
                  <Stack.Screen name="oauth" />
                  <Stack.Screen name="marketplace" />
                  <Stack.Screen name="settings" />
                </Stack>
              </NotionSyncProvider>
            </CoachProvider>
          </UserProvider>
        </RevenueCatProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
