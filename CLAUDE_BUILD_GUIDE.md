# CLAUDE.md — CoachKit Build Guide

> **Use this file with Claude Code to build the app step-by-step.**

---

## What We're Building

**CoachKit** — A mobile app with multiple AI "coaches" (modes). Users can:
- Chat with pre-built coaches (Essentialist, Strategist, Career, etc.)
- Create custom coaches
- Share coaches via link
- Set personal context (goals, values) that all coaches know

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React Native + Expo | Mobile app framework |
| TypeScript | Type safety |
| Expo Router | Navigation |
| AsyncStorage | Local data storage |
| Google Gemini API | AI responses |
| RevenueCat | Subscriptions |

---

## Step 1: Create Project

```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest coachkit --template blank-typescript

# Navigate into project
cd coachkit

# Install Expo Router and dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Install other dependencies
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-purchases
npx expo install expo-notifications
npx expo install expo-secure-store

# Install Gemini AI SDK
npm install @google/generative-ai

# Install UI helpers
npm install react-native-safe-area-context react-native-screens react-native-gesture-handler
```

---

## Step 2: Configure Expo Router

Update `package.json` — change main entry:

```json
{
  "main": "expo-router/entry"
}
```

Update `app.json`:

```json
{
  "expo": {
    "name": "CoachKit",
    "slug": "coachkit",
    "version": "1.0.0",
    "scheme": "coachkit",
    "platforms": ["ios", "android"],
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E2A5E"
    },
    "android": {
      "package": "com.yourname.coachkit",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E2A5E"
      }
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

---

## Step 3: Project Structure

Create this folder structure:

```
coachkit/
├── app/
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry → redirects based on onboarding
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── intent.tsx
│   │   ├── context.tsx
│   │   └── style.tsx
│   ├── (main)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home
│   │   ├── coaches.tsx          # Coach library
│   │   ├── create.tsx           # Create coach (Builder only)
│   │   └── profile.tsx          # Profile & context
│   ├── coach/
│   │   ├── [id].tsx             # Coach detail
│   │   └── chat.tsx             # Chat screen
│   ├── paywall/
│   │   ├── pro.tsx
│   │   └── creator.tsx
│   └── shared/
│       └── [data].tsx           # Import shared coach
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CoachCard.tsx
│   ├── ChatBubble.tsx
│   ├── ChatInput.tsx
│   └── TabBar.tsx
├── constants/
│   ├── colors.ts
│   ├── coaches.ts               # Pre-built coach definitions
│   └── typography.ts
├── services/
│   ├── ai.ts                    # Gemini API
│   ├── storage.ts               # AsyncStorage wrapper
│   └── revenuecat.ts            # Subscriptions
├── hooks/
│   ├── useUser.ts
│   ├── useCoaches.ts
│   ├── useChat.ts
│   └── useSubscription.ts
├── types/
│   └── index.ts
└── utils/
    ├── prompts.ts               # Build system prompts
    └── sharing.ts               # Encode/decode coach links
```

Create folders:

```bash
mkdir -p app/\(onboarding\) app/\(main\) app/coach app/paywall app/shared
mkdir -p components constants services hooks types utils
```

---

## Step 4: Core Files

### 4.1 Types (`types/index.ts`)

```typescript
export interface UserContext {
  name: string;
  currentFocus: string;
  biggestGoal: string;
  coachingStyle: 'gentle' | 'balanced' | 'direct';
  userType: 'seeker' | 'builder' | 'both';
  role?: string;
  values?: string[];
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
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string visningar;
  coachId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'creator';

export interface SubscriptionState {
  tier: SubscriptionTier;
  messagesToday: number;
  lastMessageDate: string;
}
```

### 4.2 Colors (`constants/colors.ts`)

```typescript
export const COLORS = {
  // Backgrounds
  bg: '#F2F3F7',
  card: '#FFFFFF',
  
  // Text
  text: '#1A1D2E',
  textSecondary: '#6B7082',
  textMuted: '#A0A4B8',
  
  // Accent (Blue - Seeker/Pro)
  accent: '#3B5BDB',
  accentLight: '#EDF2FF',
  accentDark: '#2B4299',
  
  // Purple (Builder/Creator)
  purple: '#7C3AED',
  purpleLight: '#F3EFFE',
  
  // Status
  success: '#2B9E5A',
  error: '#E53E3E',
  
  // Other
  border: '#E8EAF0',
  
  // Gradients (use with LinearGradient)
  seekerGradient: ['#1E2A5E', '#3B5BDB'],
  builderGradient: ['#4C1D95', '#7C3AED'],
};
```

### 4.3 Pre-built Coaches (`constants/coaches.ts`)

```typescript
import { Coach } from '../types';

export const BUILT_IN_COACHES: Coach[] = [
  {
    id: 'essentialist',
    name: 'The Essentialist',
    icon: '🎯',
    description: 'Focus & priorities',
    tagline: 'Do less, but better',
    category: 'Productivity',
    color: '#3B5BDB',
    examplePrompts: [
      'I have too many projects. Help me pick what matters.',
      'How do I protect my deep work time?',
      'What should I stop doing?',
    ],
    systemPrompt: `You are The Essentialist, a calm Socratic productivity coach. You help people identify what truly matters and eliminate the rest.

Your style:
- Ask probing questions rather than giving direct answers
- Help people think clearly about priorities
- Challenge them to focus on the vital few, not the trivial many

Key questions you ask:
- "What's the ONE thing that would make everything else easier?"
- "What are you doing that gives the illusion of progress?"
- "If you could only accomplish one thing today, what would it be?"

Keep responses concise (2-3 paragraphs max). End with a clear question or reflection.`,
    isCustom: false,
  },
  {
    id: 'strategist',
    name: 'The Strategist',
    icon: '♟️',
    description: 'Decisions & frameworks',
    tagline: 'Think in frameworks',
    category: 'Strategy',
    color: '#7048C6',
    examplePrompts: [
      'Help me think through this decision.',
      'What mental model should I use here?',
      'What are the second-order effects?',
    ],
    systemPrompt: `You are The Strategist, a direct, framework-driven decision coach. You use mental models to help people make better decisions.

Your style:
- Analytical and direct
- Introduce frameworks when helpful
- Challenge assumptions

Frameworks you use:
- First principles thinking
- Inversion (what would make this fail?)
- Second-order consequences
- Opportunity cost

Keep responses practical. Push for specificity and measurable outcomes.`,
    isCustom: false,
  },
  {
    id: 'career',
    name: 'Career Coach',
    icon: '🚀',
    description: 'Growth & negotiation',
    tagline: 'Level up your career',
    category: 'Career',
    color: '#E8590C',
    examplePrompts: [
      'How do I ask for a raise?',
      'Should I take this new job offer?',
      'How do I prepare for this interview?',
    ],
    systemPrompt: `You are The Career Coach, a warm but honest guide for professional growth. You help with career decisions, negotiation, and professional development.

Your style:
- Empathetic but focused on action
- Provide specific language for difficult conversations
- Challenge limiting beliefs

Areas you help with:
- Salary negotiation
- Career pivots
- Interview prep
- Workplace dynamics

Give actionable advice. When relevant, provide exact scripts or phrases they can use.`,
    isCustom: false,
  },
  {
    id: 'writer',
    name: 'The Writer',
    icon: '✍️',
    description: 'Writing & storytelling',
    tagline: 'Craft better words',
    category: 'Creative',
    color: '#9C5087',
    examplePrompts: [
      'Help me improve this paragraph.',
      'How do I make my writing clearer?',
      'I\'m stuck on how to start this.',
    ],
    systemPrompt: `You are The Writer, an encouraging writing coach focused on craft. You help people write better — emails, presentations, or creative work.

Your style:
- Encouraging but specific
- Give actionable feedback, not vague praise
- Help develop their voice, don't impose yours

Principles:
- Clarity is kindness
- Cut ruthlessly
- Show, don't tell
- Start with the reader's need

Ask to see their writing before giving advice. Offer specific suggestions.`,
    isCustom: false,
  },
  {
    id: 'mindset',
    name: 'Mindset Coach',
    icon: '🧘',
    description: 'Clarity & resilience',
    tagline: 'Build inner strength',
    category: 'Mindset',
    color: '#1B9AAA',
    examplePrompts: [
      'I\'m feeling overwhelmed.',
      'How do I stop overthinking?',
      'I\'m struggling with self-doubt.',
    ],
    systemPrompt: `You are The Mindset Coach, an empathetic guide for mental resilience. You help people reframe challenges and build inner strength.

Your style:
- Grounding and warm
- Create space for emotions
- Gently guide toward constructive perspectives

Approaches:
- Cognitive reframing
- Separating facts from stories
- Self-compassion
- Focus on what can be controlled

Acknowledge emotions before problem-solving. Offer reframes as possibilities, not prescriptions.`,
    isCustom: false,
  },
  {
    id: 'accountability',
    name: 'Accountability Partner',
    icon: '💪',
    description: 'Goals & follow-through',
    tagline: 'Stay on track',
    category: 'Habits',
    color: '#C77A19',
    examplePrompts: [
      'I keep procrastinating on this.',
      'Help me set a goal for this week.',
      'I fell off my habit. Now what?',
    ],
    systemPrompt: `You are The Accountability Partner, an energetic coach for goals and habits. You help people stay on track and call out excuses.

Your style:
- Direct and energetic
- Tough love with genuine encouragement
- Push for specifics, not vague commitments

Principles:
- Specificity creates accountability
- Small consistent actions beat big inconsistent ones
- Excuses are data, not verdicts
- Celebrate progress

Ask for specific, measurable commitments. Follow up on previous goals. Call out patterns kindly but directly.`,
    isCustom: false,
  },
];
```

### 4.4 Storage Service (`services/storage.ts`)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext, Coach, ChatSession, SubscriptionState } from '../types';

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
  if (sub.tier === 'free' && sub.messagesToday >= 5) {
    return false; // Limit reached
  }
  
  sub.messagesToday += 1;
  await saveSubscription(sub);
  return true;
}
```

### 4.5 AI Service (`services/ai.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, Message, Coach } from '../types';

// ⚠️ In production, use environment variable
const API_KEY = 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);

function buildSystemPrompt(coach: Coach, user: UserContext): string {
  const styleInstructions = {
    gentle: 'Be patient, encouraging, and gentle. Guide them to their own answers.',
    balanced: 'Be warm but direct. Balance support with healthy challenge.',
    direct: 'Be straight to the point. Challenge assumptions. No fluff.',
  };

  return `${coach.systemPrompt}

---
ABOUT THE PERSON YOU'RE COACHING:
- Name: ${user.name}
- Currently working on: ${user.currentFocus}
- Biggest goal: ${user.biggestGoal}
${user.role ? `- Role: ${user.role}` : ''}
${user.values?.length ? `- Values: ${user.values.join(', ')}` : ''}

COACHING STYLE PREFERENCE:
${styleInstructions[user.coachingStyle]}

GUIDELINES:
- Reference their specific situation naturally
- Keep responses concise (2-3 paragraphs max)
- End with a clear question or next step
- Never break character
- Never mention being an AI`;
}

export async function sendMessage(
  coach: Coach,
  user: UserContext,
  history: Message[],
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const systemPrompt = buildSystemPrompt(coach, user);
  
  // Convert history to Gemini format
  const chatHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history: chatHistory,
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
```

### 4.6 Sharing Utils (`utils/sharing.ts`)

```typescript
import { Coach } from '../types';
import { encode, decode } from 'base-64';

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
  
  const encoded = encode(JSON.stringify(data));
  return `coachkit://shared/${encoded}`;
}

export function parseShareLink(encoded: string): Coach | null {
  try {
    const data = JSON.parse(decode(encoded));
    return {
      id: `shared_${Date.now()}`,
      name: data.n,
      description: data.d,
      icon: data.i,
      tagline: data.t || data.d,
      color: data.c || '#3B5BDB',
      systemPrompt: data.p,
      examplePrompts: data.e || [],
      category: 'Shared',
      isCustom: true,
      isShared: true,
      creatorName: data.by,
    };
  } catch (e) {
    console.error('Failed to parse share link:', e);
    return null;
  }
}
```

---

## Step 5: Root Layout (`app/_layout.tsx`)

```typescript
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getUser } from '../services/storage';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="coach" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="shared" />
    </Stack>
  );
}
```

---

## Step 6: Entry Point (`app/index.tsx`)

```typescript
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getUser } from '../services/storage';
import { COLORS } from '../constants/colors';

export default function Entry() {
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const user = await getUser();
      setHasCompletedOnboarding(user?.onboardingComplete ?? false);
      setLoading(false);
    }
    checkOnboarding();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
```

---

## Step 7: Build Order

Follow this order when building screens:

### Phase 1: Onboarding (Day 1-2)
1. `app/(onboarding)/_layout.tsx` — Stack navigator
2. `app/(onboarding)/welcome.tsx` — App intro
3. `app/(onboarding)/intent.tsx` — Ask user type
4. `app/(onboarding)/context.tsx` — Name, focus, goal
5. `app/(onboarding)/style.tsx` — Coaching style preference

### Phase 2: Main Screens (Day 2-3)
6. `app/(main)/_layout.tsx` — Tab navigator
7. `app/(main)/index.tsx` — Home (Seeker or Builder)
8. `app/(main)/coaches.tsx` — Coach library
9. `app/(main)/profile.tsx` — User context & settings

### Phase 3: Chat (Day 3-4)
10. `app/coach/[id].tsx` — Coach detail
11. `app/coach/chat.tsx` — Chat interface
12. Integrate Gemini API

### Phase 4: Pro Features (Day 4-5)
13. `app/(main)/create.tsx` — Create custom coach
14. `app/paywall/pro.tsx` — Pro paywall
15. `app/paywall/creator.tsx` — Creator paywall
16. Integrate RevenueCat

### Phase 5: Sharing (Day 5)
17. `app/shared/[data].tsx` — Import shared coach
18. Add deep linking for share URLs

### Phase 6: Polish (Day 6)
19. App icon and splash screen
20. Error handling
21. Loading states
22. Testing

---

## Running the App

```bash
# Start development server
npx expo start

# Run on Android (with Expo Go or emulator)
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios

# Clear cache if issues
npx expo start --clear
```

---

## Environment Variables

Create `.env` file (add to `.gitignore`):

```
GEMINI_API_KEY=your_key_here
REVENUECAT_API_KEY=your_key_here
```

Install dotenv:
```bash
npm install react-native-dotenv
```

---

## RevenueCat Setup

1. Create account at revenuecat.com
2. Create new project
3. Add Google Play app
4. Create products:
   - `coachkit_pro_monthly` — $4.99
   - `coachkit_pro_yearly` — $39.99
   - `coachkit_creator_monthly` — $9.99
   - `coachkit_creator_yearly` — $79.99
5. Create entitlements: `pro`, `creator`
6. Get API key and add to app

---

## Google Play Internal Testing

```bash
# Build APK
npx expo build:android -t apk

# Or build AAB (recommended)
npx expo build:android -t app-bundle

# Using EAS Build (better)
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Upload to Google Play Console → Internal Testing → Add testers → Share link.

---

## Quick Commands Reference

```bash
# Start dev server
npx expo start

# Install a package
npx expo install [package-name]

# Clear cache
npx expo start --clear

# Build for Android
eas build --platform android

# Check for issues
npx expo-doctor
```

---

## File-by-File Prompts for Claude Code

When building with Claude Code, use these prompts:

**Onboarding Welcome:**
> "Create the welcome screen at app/(onboarding)/welcome.tsx. It should have the CoachKit logo, tagline, three feature pills, and a Get Started button. Use the blue gradient background from COLORS.seekerGradient."

**Intent Screen:**
> "Create the intent selection screen at app/(onboarding)/intent.tsx. Three options: 'I want coaching' (Seeker), 'I want to build' (Builder), 'Both'. Save selection to user context. The Seeker option should be pre-selected with a 'MOST POPULAR' badge."

**Home Screen:**
> "Create the home screen at app/(main)/index.tsx. Check user.userType from storage. If 'seeker', show Seeker home with blue gradient, stats, and continue session card. If 'builder', show Builder home with purple gradient and create coach CTA."

**Chat Screen:**
> "Create the chat screen at app/coach/chat.tsx. Get coachId from route params. Load coach from BUILT_IN_COACHES or custom coaches. Display messages with coach avatar on left, user on right. Input at bottom. Call sendMessage from services/ai.ts on send."

---

## Deadline Reminder

**Submit by: February 12, 2026, 11:45 PM ET**

Required:
- [ ] Working app (Google Play Internal Testing link)
- [ ] Demo video (< 3 minutes, YouTube)
- [ ] Written proposal
- [ ] Technical documentation

---

*Good luck! 🚀*
