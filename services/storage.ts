import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext, Coach, ChatSession, SubscriptionState, NotionSyncState, EnrollmentRecord, CachedQuote } from '../types';
import { FREE_DAILY_LIMIT } from '../constants/config';

// Per-user key namespacing
let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  _currentUserId = userId;
}

export function getCurrentUserId(): string | null {
  return _currentUserId;
}

function getKeys() {
  const prefix = _currentUserId ? `coachkit_${_currentUserId}` : 'coachkit';
  return {
    USER: `${prefix}_user`,
    COACHES: `${prefix}_coaches`,
    SESSIONS: `${prefix}_sessions`,
    SUBSCRIPTION: `${prefix}_subscription`,
    NOTION_SYNC: `${prefix}_notion_sync`,
    ENROLLMENTS: `${prefix}_enrollments`,
    QUOTE_CACHE: `${prefix}_quote_cache`,
  };
}

// User Context
export async function getUser(): Promise<UserContext | null> {
  const data = await AsyncStorage.getItem(getKeys().USER);
  return data ? JSON.parse(data) : null;
}

export async function saveUser(user: UserContext): Promise<void> {
  await AsyncStorage.setItem(getKeys().USER, JSON.stringify(user));
}

// Custom Coaches
export async function getCustomCoaches(): Promise<Coach[]> {
  const data = await AsyncStorage.getItem(getKeys().COACHES);
  return data ? JSON.parse(data) : [];
}

export async function saveCustomCoach(coach: Coach): Promise<void> {
  const coaches = await getCustomCoaches();
  coaches.push(coach);
  await AsyncStorage.setItem(getKeys().COACHES, JSON.stringify(coaches));
}

export async function deleteCustomCoach(coachId: string): Promise<void> {
  const coaches = await getCustomCoaches();
  const filtered = coaches.filter(c => c.id !== coachId);
  await AsyncStorage.setItem(getKeys().COACHES, JSON.stringify(filtered));
}

// Chat Sessions
export async function getSessions(): Promise<ChatSession[]> {
  const data = await AsyncStorage.getItem(getKeys().SESSIONS);
  return data ? JSON.parse(data) : [];
}

export async function saveSession(session: ChatSession): Promise<void> {
  const sessions = await getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  await AsyncStorage.setItem(getKeys().SESSIONS, JSON.stringify(sessions));
}

export async function getSessionByCoach(coachId: string): Promise<ChatSession | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.coachId === coachId) || null;
}

// Subscription State
export async function getSubscription(): Promise<SubscriptionState> {
  const data = await AsyncStorage.getItem(getKeys().SUBSCRIPTION);
  if (data) return JSON.parse(data);
  return {
    tier: 'free',
    isActive: false,
    messagesToday: 0,
    lastMessageDate: new Date().toDateString(),
  };
}

export async function saveSubscription(sub: SubscriptionState): Promise<void> {
  await AsyncStorage.setItem(getKeys().SUBSCRIPTION, JSON.stringify(sub));
}

export async function incrementMessageCount(): Promise<boolean> {
  const sub = await getSubscription();
  const today = new Date().toDateString();

  // Reset count if new day
  if (sub.lastMessageDate !== today) {
    sub.messagesToday = 0;
    sub.lastMessageDate = today;
  }

  // Check limit for free tier
  if (sub.tier === 'free' && sub.messagesToday >= FREE_DAILY_LIMIT) {
    return false;
  }

  sub.messagesToday += 1;
  await saveSubscription(sub);
  return true;
}

// Notion Sync State
export async function getNotionSyncState(): Promise<NotionSyncState> {
  const data = await AsyncStorage.getItem(getKeys().NOTION_SYNC);
  if (data) return JSON.parse(data);
  return { isSyncing: false };
}

export async function saveNotionSyncState(state: NotionSyncState): Promise<void> {
  await AsyncStorage.setItem(getKeys().NOTION_SYNC, JSON.stringify(state));
}

// Enrollments
export async function getEnrollments(): Promise<EnrollmentRecord[]> {
  const data = await AsyncStorage.getItem(getKeys().ENROLLMENTS);
  return data ? JSON.parse(data) : [];
}

export async function enrollCoach(coachId: string): Promise<void> {
  const enrollments = await getEnrollments();
  if (enrollments.some(e => e.coachId === coachId)) return; // idempotent
  enrollments.push({ coachId, enrolledAt: new Date().toISOString() });
  await AsyncStorage.setItem(getKeys().ENROLLMENTS, JSON.stringify(enrollments));
}

export async function unenrollCoach(coachId: string): Promise<void> {
  const enrollments = await getEnrollments();
  const filtered = enrollments.filter(e => e.coachId !== coachId);
  await AsyncStorage.setItem(getKeys().ENROLLMENTS, JSON.stringify(filtered));
}

// Cached Quote
export async function getCachedQuote(): Promise<CachedQuote | null> {
  const data = await AsyncStorage.getItem(getKeys().QUOTE_CACHE);
  return data ? JSON.parse(data) : null;
}

export async function saveCachedQuote(quote: CachedQuote): Promise<void> {
  await AsyncStorage.setItem(getKeys().QUOTE_CACHE, JSON.stringify(quote));
}
