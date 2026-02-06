import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext, Coach, ChatSession, SubscriptionState } from '../types';
import { FREE_DAILY_LIMIT } from '../constants/config';

const KEYS = {
  USER: 'coachkit_user',
  COACHES: 'coachkit_coaches',
  SESSIONS: 'coachkit_sessions',
  SUBSCRIPTION: 'coachkit_subscription',
};

// User Context
export async function getUser(): Promise<UserContext | null> {
  const data = await AsyncStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export async function saveUser(user: UserContext): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

// Custom Coaches
export async function getCustomCoaches(): Promise<Coach[]> {
  const data = await AsyncStorage.getItem(KEYS.COACHES);
  return data ? JSON.parse(data) : [];
}

export async function saveCustomCoach(coach: Coach): Promise<void> {
  const coaches = await getCustomCoaches();
  coaches.push(coach);
  await AsyncStorage.setItem(KEYS.COACHES, JSON.stringify(coaches));
}

export async function deleteCustomCoach(coachId: string): Promise<void> {
  const coaches = await getCustomCoaches();
  const filtered = coaches.filter(c => c.id !== coachId);
  await AsyncStorage.setItem(KEYS.COACHES, JSON.stringify(filtered));
}

// Chat Sessions
export async function getSessions(): Promise<ChatSession[]> {
  const data = await AsyncStorage.getItem(KEYS.SESSIONS);
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
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export async function getSessionByCoach(coachId: string): Promise<ChatSession | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.coachId === coachId) || null;
}

// Subscription State
export async function getSubscription(): Promise<SubscriptionState> {
  const data = await AsyncStorage.getItem(KEYS.SUBSCRIPTION);
  if (data) return JSON.parse(data);
  return {
    tier: 'free',
    isActive: false,
    messagesToday: 0,
    lastMessageDate: new Date().toDateString(),
  };
}

export async function saveSubscription(sub: SubscriptionState): Promise<void> {
  await AsyncStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(sub));
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
