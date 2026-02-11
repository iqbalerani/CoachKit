import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSubscription } from '../../hooks/useSubscription';

export default function CreatorPaywall() {
  const router = useRouter();
  const { refresh } = useSubscription();

  useEffect(() => {
    (async () => {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'pro',
      });

      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        await refresh();
      }
      router.back();
    })();
  }, []);

  return null;
}
