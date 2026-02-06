export interface UserContext {
  name: string;
  currentFocus: string;
  biggestGoal: string;
  coachingStyle: 'gentle' | 'balanced' | 'direct';
  userType: 'seeker' | 'builder' | 'both';
  role?: string;
  values?: string[];
  strengths?: string;
  struggles?: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Coach {
  id: string;
  name: string;
  icon: string;
  description: string;
  tagline: string;
  category: string;
  color: string;
  systemPrompt: string;
  examplePrompts: string[];
  isCustom: boolean;
  isShared?: boolean;
  creatorName?: string;
  shareLink?: string;
  opens?: number;
  sessions?: number;
  methodology?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  coachId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  summary?: SessionSummary;
}

export interface SessionSummary {
  summary: string;
  actionItems: string[];
  keyInsight: string;
  generatedAt: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'creator';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  messagesToday: number;
  lastMessageDate: string;
}
