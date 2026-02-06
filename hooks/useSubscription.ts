import { useState, useEffect, useCallback } from 'react';
import { SubscriptionState } from '../types';
import { getSubscription, saveSubscription, incrementMessageCount } from '../services/storage';
import { FREE_DAILY_LIMIT } from '../constants/config';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    isActive: false,
    messagesToday: 0,
    lastMessageDate: new Date().toDateString(),
  });

  useEffect(() => {
    getSubscription().then(setSubscription);
  }, []);

  const refresh = useCallback(async () => {
    const sub = await getSubscription();
    setSubscription(sub);
  }, []);

  const canSendMessage = useCallback(() => {
    if (subscription.tier !== 'free') return true;
    return subscription.messagesToday < FREE_DAILY_LIMIT;
  }, [subscription]);

  const canCreateCoach = useCallback(() => {
    return subscription.tier === 'creator';
  }, [subscription]);

  const canShareCoach = useCallback(() => {
    return subscription.tier === 'creator';
  }, [subscription]);

  const trackMessage = useCallback(async (): Promise<boolean> => {
    const allowed = await incrementMessageCount();
    if (allowed) {
      await refresh();
    }
    return allowed;
  }, [refresh]);

  const upgradeTier = useCallback(async (tier: 'pro' | 'creator') => {
    const updated: SubscriptionState = {
      ...subscription,
      tier,
      isActive: true,
    };
    await saveSubscription(updated);
    setSubscription(updated);
  }, [subscription]);

  return {
    subscription,
    canSendMessage,
    canCreateCoach,
    canShareCoach,
    trackMessage,
    upgradeTier,
    refresh,
  };
}
