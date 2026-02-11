import { useState, useEffect, useCallback } from 'react';
import { SubscriptionState } from '../types';
import { getSubscription, saveSubscription, incrementMessageCount } from '../services/storage';
import { checkEntitlement } from '../services/revenuecat';
import { FREE_DAILY_LIMIT } from '../constants/config';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    isActive: false,
    messagesToday: 0,
    lastMessageDate: new Date().toDateString(),
  });

  const refresh = useCallback(async () => {
    const hasPro = await checkEntitlement();
    const stored = await getSubscription();

    const updated: SubscriptionState = {
      ...stored,
      tier: hasPro ? 'pro' : 'free',
      isActive: hasPro,
    };

    if (stored.tier !== updated.tier || stored.isActive !== updated.isActive) {
      await saveSubscription(updated);
    }
    setSubscription(updated);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canSendMessage = useCallback(() => {
    if (subscription.tier !== 'free') return true;
    return subscription.messagesToday < FREE_DAILY_LIMIT;
  }, [subscription]);

  const trackMessage = useCallback(async (): Promise<boolean> => {
    const allowed = await incrementMessageCount();
    if (allowed) await refresh();
    return allowed;
  }, [refresh]);

  return {
    subscription,
    canSendMessage,
    trackMessage,
    refresh,
    isPro: subscription.tier !== 'free',
  };
}
