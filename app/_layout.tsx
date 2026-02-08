import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../hooks/useAuth';
import { UserProvider } from '../hooks/useUser';
import { CoachProvider } from '../hooks/useCoaches';
import { useNotionSync } from '../hooks/useNotionSync';

function NotionSyncProvider({ children }: { children: React.ReactNode }) {
  useNotionSync();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
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
                <Stack.Screen name="marketplace" />
                <Stack.Screen name="settings" />
              </Stack>
            </NotionSyncProvider>
          </CoachProvider>
        </UserProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
