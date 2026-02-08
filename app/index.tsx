import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { setCurrentUserId, getUser } from '../services/storage';
import { COLORS } from '../constants/colors';
import { UserContext } from '../types';

export default function Entry() {
  const { session, isAuthLoading } = useAuth();
  const [user, setUser] = useState<UserContext | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!session) {
      setUserLoading(false);
      return;
    }

    // Set the user ID for namespaced storage, then load user data
    setCurrentUserId(session.userId);
    getUser().then(u => {
      setUser(u);
      setUserLoading(false);
    });
  }, [session, isAuthLoading]);

  if (isAuthLoading || userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // No session — go to auth
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Session exists but no user data (or onboarding incomplete) — go to onboarding
  if (user?.onboardingComplete) {
    const route = (user.userType === 'seeker') ? '/(seeker)' : '/(builder)';
    return <Redirect href={route as any} />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
