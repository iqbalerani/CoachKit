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
  // Notion integration
  notionConnected?: boolean;
  notionSourcePageId?: string;
  notionSourcePageTitle?: string;
  notionLastSyncAt?: string;
  notionAutoSync?: boolean;
  importedFromNotion?: boolean;
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
  // Notion integration
  source?: 'built_in' | 'custom' | 'notion_import' | 'marketplace';
  notionSourcePageId?: string;
  notionExportPageId?: string;
  notionExportUrl?: string;
  notionAutoUpdate?: boolean;
  // Marketplace
  marketplaceId?: string;
  authorName?: string;
  downloads?: number;
  personality?: string;
  tone?: string;
  tags?: string[];
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
  // Enhanced fields
  id?: string;
  sessionId?: string;
  coachId?: string;
  title?: string;
  keyInsights?: string[];
  frameworks?: string[];
  tags?: string[];
  followUp?: string;
  exportedToNotion?: boolean;
  notionPageId?: string;
  notionPageUrl?: string;
}

export interface EnrollmentRecord {
  coachId: string;
  enrolledAt: string; // ISO timestamp
}

export interface CachedQuote {
  text: string;
  generatedAt: string;
  enrolledCoachIds: string[];
}

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  messagesToday: number;
  lastMessageDate: string;
}

// Notion integration types
export interface NotionConnection {
  accessToken: string;
  workspaceId: string;
  workspaceName: string;
  workspaceIcon?: string;
  botId: string;
  connectedAt: string;
}

export interface NotionPage {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
  parentType: 'workspace' | 'page' | 'database';
  url?: string;
}

export interface NotionSyncState {
  lastSyncAt?: string;
  lastSyncResult?: 'success' | 'error';
  lastSyncError?: string;
  isSyncing: boolean;
  contextPageId?: string;
  contextPageTitle?: string;
}

export interface NotionExportSettings {
  destinationPageId?: string;
  destinationPageTitle?: string;
  autoExport: boolean;
}

// Auth types
export interface AuthAccount {
  userId: string;       // Crypto.randomUUID()
  email: string;        // lowercase, trimmed
  passwordHash: string; // SHA-256(salt + password)
  salt: string;         // 16 random bytes as hex
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  lastLoginAt: string;
}

export interface MarketplaceCoach {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  color: string;
  systemPrompt: string;
  examplePrompts: string[];
  methodology?: string[];
  personality?: string;
  tone?: string;
  tags?: string[];
  authorName: string;
  downloads: number;
  rating?: number;
  createdAt: string;
  notionPageId: string;
}
