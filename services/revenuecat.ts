import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesOffering } from 'react-native-purchases';

const API_KEY = 'test_JstKTMpheGRCAsDSDEtqVQUiIkC';
const ENTITLEMENT_ID = 'pro';

/** Initialize RevenueCat SDK — call once at app startup */
export async function initializePurchases(): Promise<void> {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  Purchases.configure({ apiKey: API_KEY });
}

/** Check if user has active "pro" entitlement */
export async function checkEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

/** Get current customer info */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/** Get current offering (contains packages: monthly, yearly, lifetime) */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

/** Restore purchases */
export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Login user with app user ID (for matching RevenueCat to your auth) */
export async function loginUser(appUserId: string): Promise<void> {
  await Purchases.logIn(appUserId);
}

/** Logout user (resets to anonymous) */
export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}
