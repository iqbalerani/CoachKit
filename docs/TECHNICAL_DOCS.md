# CoachKit — Technical Documentation

> React Native + Expo AI coaching platform built for the RevenueCat Shipyard Creator Contest

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Routing & Navigation](#routing--navigation)
5. [Provider Hierarchy](#provider-hierarchy)
6. [RevenueCat Implementation](#revenuecat-implementation)
7. [AI Integration (Gemini / OpenRouter)](#ai-integration)
8. [Storage Architecture](#storage-architecture)
9. [Authentication](#authentication)
10. [Notion Integration](#notion-integration)
11. [Coach Marketplace](#coach-marketplace)
12. [Deep Link Coach Sharing](#deep-link-coach-sharing)
13. [Data Models](#data-models)
14. [Design System](#design-system)
15. [Environment Variables](#environment-variables)
16. [Data Flow Diagrams](#data-flow-diagrams)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native | 0.81.5 |
| **Platform** | Expo (managed workflow, new architecture) | 54 |
| **Language** | TypeScript (strict mode) | 5.9 |
| **Routing** | Expo Router (file-based) | 6 |
| **AI — Primary** | OpenRouter API (`google/gemini-2.0-flash`) | — |
| **AI — Fallback** | Google Gemini API (`gemini-2.0-flash`) | — |
| **Payments** | RevenueCat (`react-native-purchases`) | 9.7.6 |
| **Paywall UI** | RevenueCat UI (`react-native-purchases-ui`) | — |
| **Data Storage** | `@react-native-async-storage/async-storage` | — |
| **Secure Storage** | `expo-secure-store` | — |
| **Crypto** | `expo-crypto` (SHA-256 password hashing) | — |
| **Browser Auth** | `expo-web-browser` + `expo-auth-session` | — |
| **Animations** | React Native `Animated` API | — |

**Key architectural decision:** CoachKit has **no backend server**. The app calls AI APIs directly, uses RevenueCat SDK for subscription management, and persists all data locally. Coach sharing works through Base64-encoded deep link URLs, and the marketplace is powered by a Notion database accessed via service token.

---

## Project Structure

```
CoachKit/
├── app/                          # Expo Router — file-based screens
│   ├── _layout.tsx               # Root layout, provider hierarchy
│   ├── index.tsx                 # Entry point — auth/onboarding/home routing
│   ├── oauth.tsx                 # Notion OAuth callback handler
│   ├── settings.tsx              # App settings screen
│   ├── (auth)/                   # Authentication stack
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── welcome.tsx
│   │   ├── intent.tsx            # Seeker vs. Builder selection
│   │   ├── context.tsx           # Goals, focus, role
│   │   └── style.tsx             # Coaching style preference
│   ├── (seeker)/                 # Seeker tab navigation
│   │   ├── index.tsx             # Dashboard home
│   │   ├── coaches.tsx           # Coach library
│   │   ├── enrollments.tsx       # My Coaches
│   │   ├── notion.tsx            # Notion integration hub
│   │   └── profile.tsx           # User profile
│   ├── (builder)/                # Builder tab navigation
│   │   ├── index.tsx             # Dashboard home
│   │   ├── library.tsx           # Coach library
│   │   ├── enrollments.tsx       # My Coaches
│   │   ├── notion.tsx            # Notion integration hub
│   │   ├── create.tsx            # Coach creation wizard
│   │   └── profile.tsx           # User profile
│   ├── coach/
│   │   ├── [id].tsx              # Coach detail (dynamic route)
│   │   └── chat.tsx              # Chat interface
│   ├── paywall/
│   │   ├── pro.tsx               # RevenueCat paywall (Pro tier)
│   │   └── creator.tsx           # RevenueCat paywall (Creator tier)
│   ├── marketplace/
│   │   ├── index.tsx             # Browse marketplace
│   │   └── [id].tsx              # Marketplace coach detail
│   └── shared/
│       └── [data].tsx            # Deep link coach import
│
├── services/                     # Business logic layer
│   ├── ai.ts                    # AI provider abstraction (OpenRouter + Gemini)
│   ├── auth.ts                  # Local authentication (SecureStore)
│   ├── revenuecat.ts            # RevenueCat SDK wrapper
│   ├── storage.ts               # AsyncStorage wrapper (per-user namespaced)
│   ├── notion.ts                # Notion API integration (OAuth, read, export)
│   └── marketplace.ts           # Marketplace via Notion database
│
├── hooks/                        # React custom hooks (state management)
│   ├── useAuth.tsx              # AuthProvider + useAuth context
│   ├── useUser.tsx              # UserProvider + useUser context
│   ├── useCoaches.tsx           # CoachProvider + useCoaches context
│   ├── useChat.ts               # Chat session management
│   ├── useSubscription.ts       # RevenueCat subscription state
│   ├── useNotion.ts             # Notion OAuth connection
│   ├── useNotionSync.ts         # NotionSyncProvider + auto-sync
│   ├── useEnrollments.ts        # Coach enrollment state
│   ├── useMarketplace.ts        # Marketplace browsing & publishing
│   └── useQuote.ts              # Motivational quote caching
│
├── components/                   # Reusable UI components
│   ├── Button.tsx / Card.tsx
│   ├── ChatBubble.tsx / ChatInput.tsx
│   ├── CoachCard.tsx / CoachLibrary.tsx
│   ├── MarketplaceCard.tsx
│   ├── DashboardHome.tsx
│   ├── EnrolledCoachesList.tsx
│   ├── NotionHub.tsx            # Full Notion integration UI
│   ├── NotionConnectCard.tsx / NotionPagePicker.tsx
│   ├── NotionProfileSection.tsx
│   ├── ParsedContextReview.tsx / ParsedCoachReview.tsx
│   ├── SessionSummaryCard.tsx
│   ├── SwipeableCoachCard.tsx
│   ├── BrandHeader.tsx
│   └── animated/                # Animation components
│       ├── AnimatedPressable.tsx
│       ├── AnimatedTabIcon.tsx
│       ├── AnimatedProgressBar.tsx
│       ├── FadeInView.tsx
│       ├── StaggerList.tsx
│       └── TypingDots.tsx
│
├── constants/                    # Static configuration
│   ├── coaches.ts               # 6 built-in coach definitions
│   ├── colors.ts                # Design tokens (dark theme)
│   ├── typography.ts            # Font sizes, spacing, radius
│   └── config.ts                # FREE_DAILY_LIMIT = 50
│
├── types/
│   └── index.ts                 # All TypeScript interfaces
│
├── utils/
│   └── sharing.ts               # Base64 deep link encoding/decoding
│
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript (extends expo/tsconfig.base)
└── package.json                 # Dependencies
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                          │
│  Screens (app/) ──── Components (components/)       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                State Management                      │
│  Hooks (hooks/) ──── React Context Providers         │
│  useAuth · useUser · useCoaches · useSubscription    │
│  useChat · useNotion · useNotionSync · useEnrollments│
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Service Layer                        │
│  ai.ts · auth.ts · revenuecat.ts · storage.ts       │
│  notion.ts · marketplace.ts                          │
└──────┬──────────┬───────────┬──────────┬────────────┘
       │          │           │          │
  ┌────▼───┐ ┌───▼────┐ ┌────▼───┐ ┌────▼──────┐
  │OpenRouter│ │RevenueCat│ │AsyncStorage│ │Notion API│
  │Gemini API│ │  SDK   │ │SecureStore │ │          │
  └─────────┘ └────────┘ └──────────┘ └──────────┘
```

**Data flow:** `Screens → Hooks → Services → Storage / External APIs`

---

## Routing & Navigation

The app uses Expo Router's file-based routing. The root `app/index.tsx` acts as a router, redirecting based on state:

```
App Launch
    │
    ▼
Auth loading? ──yes──▶ Show splash/loading
    │ no
    ▼
Has session? ──no──▶ /(auth)/sign-in
    │ yes
    ▼
Onboarding complete? ──no──▶ /(onboarding)/welcome
    │ yes
    ▼
userType === 'builder'? ──yes──▶ /(builder)
    │ no
    ▼
/(seeker)
```

**Route groups:**

| Group | Purpose | Layout |
|-------|---------|--------|
| `(auth)` | Sign-in / sign-up | Stack |
| `(onboarding)` | Welcome → Intent → Context → Style | Stack |
| `(seeker)` | Seeker experience | Bottom tabs (Home, Coaches, My Coaches, Notion) |
| `(builder)` | Builder experience | Bottom tabs (Home, Library, My Coaches, Notion) |

**Standalone routes:** `coach/[id]`, `coach/chat`, `paywall/pro`, `marketplace/*`, `shared/[data]`, `settings`, `oauth`

---

## Provider Hierarchy

Defined in `app/_layout.tsx`, providers wrap the entire app in this order:

```tsx
<GestureHandlerRootView>
  <AuthProvider>              // Auth session state
    <RevenueCatProvider>      // SDK init + user login
      <UserProvider>          // User profile context
        <CoachProvider>       // Coach library state
          <NotionSyncProvider> // Background Notion sync
            <Stack />
          </NotionSyncProvider>
        </CoachProvider>
      </UserProvider>
    </RevenueCatProvider>
  </AuthProvider>
</GestureHandlerRootView>
```

**RevenueCatProvider** is an inline component that initializes the SDK on mount and logs in the authenticated user:

```tsx
function RevenueCatProvider({ children }) {
  const { session } = useAuth();

  useEffect(() => {
    initializePurchases();
  }, []);

  useEffect(() => {
    if (session?.userId) {
      loginUser(session.userId);
    }
  }, [session?.userId]);

  return <>{children}</>;
}
```

---

## RevenueCat Implementation

### Configuration

| Setting | Value |
|---------|-------|
| **SDK** | `react-native-purchases` v9.7.6 |
| **UI SDK** | `react-native-purchases-ui` |
| **API Key** | `test_JstKTMpheGRCAsDSDEtqVQUiIkC` (sandbox) |
| **Entitlement ID** | `pro` |
| **Tiers** | Free / Pro ($4.99/mo) / Creator ($9.99/mo) |
| **Free daily limit** | 50 messages |

### SDK Initialization (`services/revenuecat.ts`)

```typescript
import Purchases from 'react-native-purchases';

const API_KEY = 'test_JstKTMpheGRCAsDSDEtqVQUiIkC';
const ENTITLEMENT_ID = 'pro';

export async function initializePurchases(): Promise<void> {
  Purchases.configure({ apiKey: API_KEY });
}
```

### User Identity

RevenueCat user identity is synced with local auth. On sign-in/sign-up, the auth user ID is passed to RevenueCat:

```typescript
// services/revenuecat.ts
export async function loginUser(appUserId: string): Promise<void> {
  await Purchases.logIn(appUserId);
}

export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}
```

Called from `hooks/useAuth.tsx`:
- `signUp()` → `loginUser(session.userId)`
- `signIn()` → `loginUser(session.userId)`
- `signOut()` → `logoutUser()`

### Entitlement Checks

```typescript
// services/revenuecat.ts
export async function checkEntitlement(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}
```

The `useSubscription` hook polls RevenueCat for the current entitlement:

```typescript
// hooks/useSubscription.ts
const refresh = async () => {
  const hasPro = await checkEntitlement();
  const stored = await getSubscription();
  const updated: SubscriptionState = {
    ...stored,
    tier: hasPro ? 'pro' : 'free',
    isActive: hasPro,
  };
  if (stored.tier !== updated.tier) await saveSubscription(updated);
  setSubscription(updated);
};
```

**Hook interface:**

```typescript
useSubscription() → {
  subscription: SubscriptionState,   // { tier, isActive, messagesToday, lastMessageDate }
  canSendMessage: () => boolean,     // true if pro OR messagesToday < 50
  trackMessage: () => Promise<boolean>, // increment count, refresh entitlement
  refresh: () => Promise<void>,      // re-check RevenueCat
  isPro: boolean,                    // tier !== 'free'
}
```

### Paywall Presentation (`app/paywall/pro.tsx`)

Uses RevenueCatUI's native paywall with automatic entitlement gating:

```typescript
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export default function ProPaywall() {
  const { refresh } = useSubscription();

  useEffect(() => {
    (async () => {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'pro',
      });
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        await refresh(); // Pick up new entitlement
      }
      router.back();
    })();
  }, []);

  return null; // Native paywall overlay
}
```

### Message Gating in Chat (`app/coach/chat.tsx`)

```typescript
const handleSend = async (text: string) => {
  if (!canSendMessage()) {
    router.push('/paywall/pro');  // Hit daily limit → show paywall
    return;
  }
  const allowed = await trackMessage(); // Increment count
  if (!allowed) {
    router.push('/paywall/pro');
    return;
  }
  await sendMessage(text); // Proceed with AI call
};
```

### Daily Message Tracking (`services/storage.ts`)

```typescript
export async function incrementMessageCount(): Promise<boolean> {
  const sub = await getSubscription();
  const today = new Date().toDateString();

  // Reset count if new day
  if (sub.lastMessageDate !== today) {
    sub.messagesToday = 0;
    sub.lastMessageDate = today;
  }

  if (sub.tier === 'free' && sub.messagesToday >= FREE_DAILY_LIMIT) {
    return false; // Limit reached
  }

  sub.messagesToday += 1;
  await saveSubscription(sub);
  return true;
}
```

### Additional RevenueCat Features

```typescript
// Restore purchases (in Settings screen)
export async function restorePurchases(): Promise<CustomerInfo>

// Get offerings for custom paywall display
export async function getCurrentOffering(): Promise<PurchasesOffering | null>

// Get full customer info
export async function getCustomerInfo(): Promise<CustomerInfo>
```

### RevenueCat Integration Points Summary

| Feature | Location | Method |
|---------|----------|--------|
| SDK init | `app/_layout.tsx` → `RevenueCatProvider` | `initializePurchases()` |
| User login | `hooks/useAuth.tsx` → sign-in/sign-up | `loginUser(userId)` |
| User logout | `hooks/useAuth.tsx` → sign-out | `logoutUser()` |
| Entitlement check | `hooks/useSubscription.ts` → `refresh()` | `checkEntitlement()` |
| Paywall display | `app/paywall/pro.tsx` | `RevenueCatUI.presentPaywallIfNeeded()` |
| Message gating | `app/coach/chat.tsx` → `handleSend()` | `canSendMessage()` + `trackMessage()` |
| Restore purchases | `app/settings.tsx` | `restorePurchases()` |
| Customer Center | `app/settings.tsx` | RevenueCat Customer Center |

---

## AI Integration

### Dual-Provider Architecture

CoachKit uses a **primary + fallback** AI strategy for reliability:

```
User Message
     │
     ▼
OpenRouter API (primary)
  model: google/gemini-2.0-flash
  timeout: 15s
     │
     ├── Success → Return response
     │
     └── Error → Fallback
                    │
                    ▼
              Gemini API (fallback)
                model: gemini-2.0-flash
                timeout: 15s
```

### System Prompt Construction (`services/ai.ts`)

Every conversation assembles a dynamic system prompt from three sources:

```typescript
function buildSystemPrompt(coach: Coach, user: UserContext): string {
  return `${coach.systemPrompt}

--- ABOUT THE PERSON YOU'RE COACHING ---
Name: ${user.name}
Current Focus: ${user.currentFocus}
Biggest Goal: ${user.biggestGoal}
Role: ${user.role || 'Not specified'}
Strengths: ${user.strengths || 'Not specified'}
Struggles: ${user.struggles || 'Not specified'}
Values: ${user.values?.join(', ') || 'Not specified'}

--- COACHING STYLE ---
${styleInstructions[user.coachingStyle]}

--- GUIDELINES ---
- Keep responses concise (2-3 paragraphs max)
- Reference their specific situation
- End with a clear question or actionable next step
- Never break character`;
}
```

**Coaching style instructions:**

| Style | Behavior |
|-------|----------|
| `gentle` | Socratic questioning, ask before advising, reflective |
| `balanced` | Warm but direct, mix validation with challenge |
| `direct` | Get to the point, actionable steps, challenge assumptions |

### Message Flow

```typescript
export async function sendMessage(
  coach: Coach,
  user: UserContext,
  history: Message[],
  userMessage: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(coach, user);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
  return callAI(messages); // OpenRouter → Gemini fallback
}
```

### AI-Powered Features

| Feature | Function | Purpose |
|---------|----------|---------|
| Chat | `sendMessage()` | Core coaching conversation |
| Session summaries | `generateSessionSummary()` | JSON summary with title, action items, key insights, frameworks |
| Motivational quotes | `generateMotivationalQuote()` | Personalized daily quote based on user context + enrolled coaches |
| Notion context parsing | `parseNotionContext()` | Extract user context fields from Notion page content |
| Notion coach parsing | `parseNotionCoachInstructions()` | Extract coach definition from Notion page content |
| General parsing | `parseWithAI()` | Generic system-instruction + prompt AI call |

---

## Storage Architecture

### Per-User Namespacing

All AsyncStorage keys are prefixed with the authenticated user ID, enabling multi-account support on a single device:

```typescript
// services/storage.ts
let _currentUserId: string | null = null;

const getKeys = () => {
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
};
```

### AsyncStorage Keys

| Key Pattern | Type | Contents |
|-------------|------|----------|
| `coachkit_{userId}_user` | `UserContext` | Name, goals, coaching style, user type, Notion settings |
| `coachkit_{userId}_coaches` | `Coach[]` | Custom and imported coaches |
| `coachkit_{userId}_sessions` | `ChatSession[]` | All chat sessions with full message history |
| `coachkit_{userId}_subscription` | `SubscriptionState` | Tier, daily message count, last message date |
| `coachkit_{userId}_notion_sync` | `NotionSyncState` | Last sync time, result, error |
| `coachkit_{userId}_enrollments` | `EnrollmentRecord[]` | Enrolled coach IDs with timestamps |
| `coachkit_{userId}_quote_cache` | `CachedQuote` | Cached motivational quote (6-hour TTL) |

### SecureStore Keys (Encrypted)

| Key | Type | Contents |
|-----|------|----------|
| `coachkit_accounts` | `AuthAccount[]` | All accounts with password hashes and salts |
| `coachkit_active_session` | `AuthSession` | Active session (userId, email, lastLoginAt) |
| `coachkit_{userId}_notion_connection` | `NotionConnection` | Notion OAuth token, workspace info |

---

## Authentication

CoachKit uses **local-only authentication** with `expo-secure-store` and `expo-crypto`:

```
Sign Up Flow:
  1. Normalize email (lowercase, trimmed)
  2. Generate 16-byte random salt (expo-crypto)
  3. Hash password: SHA-256(salt + password)
  4. Store account in SecureStore
  5. Create session, set as active
  6. Set storage userId for namespacing
  7. Log in with RevenueCat (loginUser)

Sign In Flow:
  1. Look up account by normalized email
  2. Verify password hash matches
  3. Set active session
  4. Set storage userId
  5. Log in with RevenueCat
```

**No server-side auth.** Accounts exist only on-device. This is intentional — CoachKit is a local-first app with zero backend infrastructure.

---

## Notion Integration

### OAuth Connection Flow

```
User taps "Connect Notion"
    │
    ▼
expo-web-browser opens OAuth URL
    │
    ├── iOS: ASWebAuthenticationSession (native)
    │         Callback: coachkit://oauth?code=...
    │
    └── Android: Chrome Custom Tab
                 → https://iqbalerani.github.io/CoachKit/oauth/
                 → Intermediary page fires deep link
                 → coachkit://oauth?code=...
    │
    ▼
app/oauth.tsx extracts code
    │
    ▼
exchangeCodeForToken(code, redirectUri)
    POST https://api.notion.com/v1/oauth/token
    Authorization: Basic(CLIENT_ID:CLIENT_SECRET)
    │
    ▼
Save NotionConnection to SecureStore (per-user)
```

### Notion Features

| Feature | Description |
|---------|-------------|
| **Context import** | Read a Notion page → AI extracts user context fields → update UserContext |
| **Auto-sync** | Background sync every 24h when app foregrounds (reads source page, updates context) |
| **Coach import** | Read a Notion page → AI extracts coach definition → add to coach library |
| **Session export** | Generate session summary → create formatted Notion page with insights, action items, frameworks |
| **Coach export** | Export coach definition to Notion page with system prompt, methodology, personality |
| **Page search** | Search user's Notion workspace for pages and databases |

### Auto-Sync (`hooks/useNotionSync.ts`)

- **Trigger:** AppState changes to `'active'` (foreground)
- **Conditions:** `user.notionConnected && user.notionAutoSync`
- **Interval:** Max once per 24 hours
- **Action:** Reads `user.notionSourcePageId`, parses context with AI, merges into UserContext

---

## Coach Marketplace

The marketplace is powered by a **Notion database** accessed via a service token — no custom backend needed.

### Architecture

```
CoachKit App
     │
     ▼
services/marketplace.ts
     │
     ▼
Notion API (v2022-06-28)
  Token: EXPO_PUBLIC_MARKETPLACE_TOKEN (service account)
  Database: EXPO_PUBLIC_MARKETPLACE_DB_ID
```

### Database Schema (Notion Properties)

| Property | Type | Maps To |
|----------|------|---------|
| Name | Title | `coach.name` |
| Description | Rich text | `coach.description` |
| Icon | Rich text | `coach.icon` |
| Color | Rich text | `coach.color` |
| SystemPrompt | Rich text | `coach.systemPrompt` |
| ExamplePrompts | Rich text | `coach.examplePrompts` (JSON array) |
| Methodology | Rich text | `coach.methodology` (JSON array) |
| Personality | Rich text | `coach.personality` |
| Tone | Rich text | `coach.tone` |
| Category | Select | `coach.category` |
| Tags | Multi-select | `coach.tags` |
| Author | Rich text | `coach.authorName` |
| Downloads | Number | `coach.downloads` |
| Rating | Number | `coach.rating` |

### Operations

- **Browse:** Query database with category filters and sorts (downloads, newest, name). Client-side text search on name, description, author.
- **Publish:** Create page in marketplace database with coach properties.
- **Import:** Convert `MarketplaceCoach` to local `Coach` with `source: 'marketplace'`.
- **Download tracking:** Increment `Downloads` property on import (non-critical, silently fails).

---

## Deep Link Coach Sharing

Coach sharing works **without a server** — coach data is encoded directly into the URL.

### Encoding (`utils/sharing.ts`)

```typescript
export function generateShareLink(coach: Coach, creatorName: string): string {
  const data = {
    n: coach.name,
    d: coach.description,
    i: coach.icon,
    t: coach.tagline,
    c: coach.color,
    p: coach.systemPrompt,
    e: coach.examplePrompts,
    by: creatorName,
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  return `coachkit://shared/${encoded}`;
}
```

### Decoding

```typescript
export function parseShareLink(encoded: string): Coach | null {
  const data = JSON.parse(decodeURIComponent(atob(encoded)));
  return {
    id: `shared_${Date.now()}`,
    name: data.n,
    description: data.d,
    icon: data.i,
    tagline: data.t,
    color: data.c,
    systemPrompt: data.p,
    examplePrompts: data.e,
    category: 'Shared',
    isCustom: true,
    isShared: true,
    creatorName: data.by,
  };
}
```

### Share Flow

```
Creator generates link: coachkit://shared/{Base64(JSON)}
    │
    ▼
Shares via any messaging app (iMessage, WhatsApp, etc.)
    │
    ▼
Recipient taps link → Deep link opens app
    │
    ▼
app/shared/[data].tsx decodes coach data
    │
    ▼
Preview screen: icon, name, description, "Shared by [creator]"
    │
    ▼
"Add to My Coaches" → imports to local library
```

---

## Data Models

### Core Types (`types/index.ts`)

```typescript
// User profile — persists across all conversations
interface UserContext {
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
  // Notion integration fields
  notionConnected?: boolean;
  notionSourcePageId?: string;
  notionSourcePageTitle?: string;
  notionLastSyncAt?: string;
  notionAutoSync?: boolean;
  importedFromNotion?: boolean;
}

// Coach definition — built-in, custom, or imported
interface Coach {
  id: string;
  name: string;
  icon: string;           // Emoji
  description: string;
  tagline: string;
  category: string;
  color: string;          // Hex color
  systemPrompt: string;   // AI persona instructions
  examplePrompts: string[];
  isCustom: boolean;
  isShared?: boolean;
  creatorName?: string;
  methodology?: string[];
  source?: 'built_in' | 'custom' | 'notion_import' | 'marketplace';
  personality?: string;
  tone?: string;
  tags?: string[];
  // Marketplace fields
  marketplaceId?: string;
  authorName?: string;
  downloads?: number;
  // Notion fields
  notionSourcePageId?: string;
  notionExportPageId?: string;
  notionExportUrl?: string;
}

// Chat message
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Chat session with full history
interface ChatSession {
  id: string;
  coachId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  summary?: SessionSummary;
}

// AI-generated session summary
interface SessionSummary {
  title?: string;
  summary: string;
  actionItems: string[];
  keyInsight: string;
  keyInsights?: string[];
  frameworks?: string[];
  tags?: string[];
  followUp?: string;
  generatedAt: string;
  exportedToNotion?: boolean;
  notionPageId?: string;
  notionPageUrl?: string;
}

// Subscription state
type SubscriptionTier = 'free' | 'pro';
interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  messagesToday: number;
  lastMessageDate: string;
}

// Auth
interface AuthAccount {
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface AuthSession {
  userId: string;
  email: string;
  lastLoginAt: string;
}

// Notion
interface NotionConnection {
  accessToken: string;
  workspaceId: string;
  workspaceName: string;
  workspaceIcon?: string;
  botId: string;
  connectedAt: string;
}

// Marketplace
interface MarketplaceCoach {
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

// Enrollment
interface EnrollmentRecord {
  coachId: string;
  enrolledAt: string;
}
```

---

## Design System

### Color Tokens (`constants/colors.ts`)

CoachKit uses a **dark theme** with emerald accent:

```
Background:  #0A0A0F     (near-black)
Card:        #16161E     (dark surface)
Surface:     #1E1E28     (input backgrounds)
Text:        #FFFFFF     (primary)
Secondary:   #9CA3AF     (muted text)
Accent:      #10B981     (emerald — primary actions)
Error:       #EF4444     (red)
Border:      rgba(255, 255, 255, 0.08)
```

### Typography (`constants/typography.ts`)

| Token | Size | Weight | Use Case |
|-------|------|--------|----------|
| `h1` | 28 | 800 | Screen titles |
| `h2` | 24 | 800 | Section headers |
| `h3` | 18 | 700 | Card titles |
| `body` | 14 | 400 | Body text |
| `bodySmall` | 12 | 400 | Secondary text |
| `button` | 16 | 700 | Button labels |
| `label` | 13 | 600 | Form labels |
| `caption` | 10 | 500 | Badges, tags |

### Spacing

```
xs: 4   sm: 8   md: 16   lg: 24   xl: 32   xxl: 48
```

### Border Radius

```
sm: 8   md: 12   lg: 16   xl: 20   full: 9999
```

### Built-In Coach Colors

| Coach | Color | Hex |
|-------|-------|-----|
| The Essentialist | Green | `#10B981` |
| The Strategist | Purple | `#8B5CF6` |
| Career Coach | Amber | `#F59E0B` |
| The Writer | Pink | `#EC4899` |
| Mindset Coach | Cyan | `#06B6D4` |
| Accountability Partner | Orange | `#F97316` |

---

## Environment Variables

Required in `.env`:

```bash
# AI Providers
EXPO_PUBLIC_GEMINI_API_KEY=           # Google Gemini API key (fallback)
EXPO_PUBLIC_OPENROUTER_API_KEY=       # OpenRouter API key (primary)
EXPO_PUBLIC_OPENROUTER_MODEL=         # Default: google/gemini-2.0-flash

# Notion Integration
EXPO_PUBLIC_NOTION_CLIENT_ID=         # Notion OAuth app client ID
EXPO_PUBLIC_NOTION_CLIENT_SECRET=     # Notion OAuth app client secret

# Marketplace
EXPO_PUBLIC_MARKETPLACE_TOKEN=        # Notion service token for marketplace DB
EXPO_PUBLIC_MARKETPLACE_DB_ID=        # Notion database ID for marketplace
```

---

## Data Flow Diagrams

### Chat Message Flow

```
User types message
    │
    ▼
useChat.sendMessage(text)
    │
    ▼
useSubscription.canSendMessage()
    │
    ├── false → router.push('/paywall/pro')
    │
    └── true
         │
         ▼
    useSubscription.trackMessage()
         │ increments daily count in AsyncStorage
         │
         ▼
    services/ai.sendMessage(coach, user, history, text)
         │
         ▼
    buildSystemPrompt(coach, user)
         │ coach.systemPrompt + user context + coaching style
         │
         ▼
    callAI(messages)
         │
         ├── callOpenRouter() ── success ──▶ response
         │
         └── error ── callGemini() ──▶ response
         │
         ▼
    Add assistant message to session
    Save session to AsyncStorage
```

### Subscription Check Flow

```
useSubscription.refresh()
    │
    ▼
services/revenuecat.checkEntitlement()
    │
    ▼
Purchases.getCustomerInfo()
    │
    ▼
customerInfo.entitlements.active['pro'] exists?
    │
    ├── yes → tier: 'pro', isActive: true
    │
    └── no  → tier: 'free', isActive: false
    │
    ▼
Save to AsyncStorage + update React state
```

### Onboarding Flow

```
Sign Up / Sign In
    │
    ▼
/(onboarding)/welcome
    │
    ▼
/(onboarding)/intent
    │ Select: Seeker or Builder
    │
    ▼
/(onboarding)/context
    │ Enter: name, focus, goal, role
    │
    ▼
/(onboarding)/style
    │ Select: gentle, balanced, or direct
    │
    ▼
saveUser({ ...context, onboardingComplete: true })
    │
    ▼
Redirect to /(seeker) or /(builder)
```

---

*CoachKit — Built for the RevenueCat Shipyard Creator Contest. Zero backend, maximum impact.*
