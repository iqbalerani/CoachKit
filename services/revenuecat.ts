import { SubscriptionState } from '../types';

// Mock implementation — replace with real RevenueCat SDK in Phase 7
export async function initializePurchases(): Promise<void> {
  // TODO: Purchases.configure({ apiKey: REVENUECAT_API_KEY });
}

export async function checkSubscription(): Promise<SubscriptionState> {
  // Mock: returns free tier
  return {
    tier: 'free',
    isActive: false,
    messagesToday: 0,
    lastMessageDate: new Date().toDateString(),
  };
}

export async function restorePurchases(): Promise<boolean> {
  // TODO: Implement with RevenueCat
  return false;
}

export async function purchasePackage(_packageId: string): Promise<boolean> {
  // TODO: Implement with RevenueCat
  return false;
}
