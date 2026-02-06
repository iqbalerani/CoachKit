import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getUser } from '../services/storage';
import { COLORS } from '../constants/colors';
import { UserContext } from '../types';

export default function Entry() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    getUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (user?.onboardingComplete) {
    const route = (user.userType === 'seeker') ? '/(seeker)' : '/(builder)';
    return <Redirect href={route as any} />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
