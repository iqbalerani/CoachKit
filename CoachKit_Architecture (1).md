# CoachKit — Complete Product & Architecture Document

> **Version:** 1.0  
> **Last Updated:** February 6, 2026  
> **Target:** RevenueCat Shipyard Creator Contest (Simon/BetterCreating Brief)  
> **Deadline:** February 12, 2026 (11:45 PM ET)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Creator Brief](#2-the-creator-brief)
3. [Target Audience](#3-target-audience)
4. [User Types & Personas](#4-user-types--personas)
5. [Core Value Proposition](#5-core-value-proposition)
6. [Feature Set](#6-feature-set)
7. [Three-Tier Monetization Model](#7-three-tier-monetization-model)
8. [User Flows](#8-user-flows)
9. [Screen-by-Screen Specification](#9-screen-by-screen-specification)
10. [Technical Architecture](#10-technical-architecture)
11. [Data Models](#11-data-models)
12. [AI & Prompt Engineering](#12-ai--prompt-engineering)
13. [RevenueCat Integration](#13-revenuecat-integration)
14. [Design System](#14-design-system)
15. [Build Timeline](#15-build-timeline)
16. [Submission Requirements](#16-submission-requirements)
17. [Success Metrics](#17-success-metrics)

---

## 1. Executive Summary

### One-Liner
**CoachKit: Your pocket team of AI coaches. Pick a coach. Chat. Get somewhere.**

### What It Is
CoachKit is a beautiful, minimal mobile app that gives users access to a library of specialized AI coaches. Users can get coaching, create their own custom coaches, and share them with anyone via a link. It's designed for productivity enthusiasts who want AI that feels purposeful, not generic.

### Why It Wins
- **Audience Fit (30%):** Mirrors Simon's existing AgentOS concept. His audience already pays for multi-mode AI coaching systems in Notion.
- **User Experience (25%):** Minimal, clean design matching Simon's aesthetic. Zero setup friction.
- **Monetization (20%):** Three-tier model (Free → Pro → Creator) shows sustainable business potential.
- **Innovation (15%):** Personalized onboarding, specialized coaches with context, create & share functionality.
- **Technical Quality (10%):** Simple architecture = stable app. Local-first = fast.

---

## 2. The Creator Brief

### Simon's Exact Words
> "Imagine a beautiful minimal app where users can download, create, and share AI coaches. An interface that demystifies what AI agents can do and just lets you start. Maybe there's a space to add your personal context and your values, then you just pick the coach, chat with it, and you get somewhere."

### Key Requirements from Brief
| Requirement | How CoachKit Delivers |
|-------------|----------------------|
| Beautiful, minimal app | Clean design system, typography-driven, generous whitespace |
| Download coaches | Pre-built coach library with 6 specialized coaches |
| Create coaches | Custom coach builder with instructions, icon, personality |
| Share coaches | Generate shareable link, anyone can use it |
| Personal context & values | Onboarding captures goals, context, values, coaching style |
| Pick coach → chat → get somewhere | Simple flow: browse → select → start session |
| Demystify AI agents | No technical setup, just tap and start |

### Simon's Audience
> "My audience is obsessed with productivity, great design, and building systems."

---

## 3. Target Audience

### Demographics
- **Age:** 25–45 years old
- **Gender:** Predominantly male
- **Location:** Global, English-speaking
- **Tech Comfort:** High — they use Notion, Obsidian, productivity tools
- **Income:** Middle to upper-middle class, willing to pay for tools

### Psychographics
- Watch productivity YouTube (Ali Abdaal, Thomas Frank, Simon)
- Read books like Atomic Habits, Deep Work, Essentialism
- Build personal systems and workflows
- Value great design and minimalism
- Early adopters of AI tools
- Willing to pay for quality digital products ($29-49 for Notion templates)

### What They Want
- AI that feels purposeful, not generic
- Tools that "just work" without hours of setup
- Customization and personalization
- Clean, minimal interfaces
- Actionable outcomes, not just information

### What They Don't Want
- Generic ChatGPT wrappers
- Cluttered, ugly interfaces
- Complex setup flows
- Features that feel like filler
- Subscriptions that don't deliver value

---

## 4. User Types & Personas

### User Type 1: The Seeker (~70% of users)

**Profile:** Sarah, 32, Marketing Manager
- Wants guidance on career decisions, productivity, goal-setting
- Opens app when stuck or needs clarity
- Values unlimited access to coaching
- Not interested in building or creating
- Will pay for convenience and unlimited access

**Jobs to Be Done:**
- Get clarity on a decision
- Work through a challenge
- Stay accountable to goals
- Get motivated

**Tier Fit:** Free → Pro ($4.99/month)

---

### User Type 2: The Builder (~25% of users)

**Profile:** Marcus, 28, Solopreneur
- Loves building systems and workflows
- Wants to create custom coaches for specific needs
- Enjoys tweaking and personalizing
- May share coaches with friends or community
- Power user of Notion, productivity tools

**Jobs to Be Done:**
- Create a coach for a specific purpose
- Customize existing coaches
- Share creations with others
- Experiment with AI capabilities

**Tier Fit:** Pro → Creator ($9.99/month)

---

### User Type 3: The Coach/Creator (~5% of users)

**Profile:** David, 40, Executive Coach
- Actual coach, consultant, or creator
- Wants to deploy AI coaching to clients/audience
- Cares about analytics and reach
- High willingness to pay for professional tools
- May promote CoachKit to their audience

**Jobs to Be Done:**
- Create branded coaching experiences
- Share with clients or audience
- Track engagement and usage
- Scale coaching beyond 1:1

**Tier Fit:** Creator ($9.99/month)

---

## 5. Core Value Proposition

### For Seekers
> "Get personalized AI coaching from specialized experts — anytime, anywhere. No booking, no cost of a real coach, no judgment."

### For Builders
> "Create your own AI coaches with custom personalities, share them with a link, and see who's using them."

### For Coaches/Creators
> "Deploy AI coaching to your audience at scale. Create once, share everywhere."

### Differentiation from ChatGPT
| ChatGPT | CoachKit |
|---------|----------|
| General purpose | Specialized coaches with distinct personalities |
| No context persistence | Remembers your goals, values, situation |
| One AI | Library of coaches for different needs |
| Can't share custom prompts easily | One-tap share via link |
| Technical feeling | Beautiful, minimal, purposeful |

---

## 6. Feature Set

### Core Features (MVP)

#### 6.1 Coach Library
- 6 pre-built specialized coaches
- Browse by category
- Coach detail view with personality, style, example prompts
- Quick-start buttons for common needs

#### 6.2 Personal Context System
- Name, current focus, biggest goal
- Optional: role, values, strengths, struggles
- Coaching style preference (Gentle / Balanced / Direct)
- Context injected into every coach conversation

#### 6.3 Chat Interface
- Clean, minimal chat UI
- Coach avatar on messages
- Typing indicator
- Chat history persistence
- New session option

#### 6.4 Create Coach (Pro Feature)
- Icon picker (emoji)
- Name and description
- Custom instructions/personality
- Accent color selection
- Share toggle

#### 6.5 Share Coaches
- Generate shareable link
- Anyone with link can add to their library
- Shows who shared it
- No account required to use shared coaches

#### 6.6 Personalized Onboarding
- Ask user intent (Seeker vs Builder vs Both)
- Collect personal context
- Set coaching style preference
- Route to personalized home screen

#### 6.7 Session Summaries
- Auto-generated after each conversation
- 3-sentence summary
- Clear action items
- Key insight from session

#### 6.8 Coaching Templates
- Pre-built structured sessions:
  - 🎯 Weekly Review
  - ⚖️ Decision Helper
  - 🚀 Goal Setting
  - 🔥 Motivation Boost
- Guided conversation flow

---

### Future Features (Post-MVP)

- **Proactive Notifications:** Coaches reach out with check-ins
- **Community Library:** Browse and discover user-created coaches
- **Voice Mode:** Talk to coaches instead of typing
- **Progress Tracking:** Long-term insights and patterns
- **Coach Remix:** Fork and customize community coaches
- **Multi-Coach Conversations:** Get perspectives from multiple coaches
- **Export to Notion:** Send summaries directly to Notion

---

## 7. Three-Tier Monetization Model

### Tier 1: Free
**Price:** $0

**Included:**
- Access to all 6 built-in coaches
- 5 messages per day (across all coaches)
- Basic personal context (name, goal, working on)
- Use shared coaches from others
- Chat history (local)

**Limitations:**
- Daily message cap
- Cannot create custom coaches
- Cannot share coaches
- No session summaries

**Purpose:** Let users experience value before paying

---

### Tier 2: Pro
**Price:** $4.99/month or $39.99/year (save 33%)

**Target User:** Seekers who want unlimited coaching

**Included:**
- Everything in Free
- ✅ **Unlimited messages** — no daily cap
- ✅ **Extended context** — values, strengths, struggles
- ✅ **Session summaries** — auto-generated after conversations
- ✅ **Chat export** — save conversations
- ✅ **Priority responses** — faster AI processing
- ✅ **Coaching templates** — structured sessions

**Cannot:**
- Create custom coaches
- Share coaches

**Why This Price:** $4.99 is an impulse buy. Simon's audience pays $29-49 for Notion templates, so monthly subscription is comfortable.

---

### Tier 3: Creator
**Price:** $9.99/month or $79.99/year (save 33%)

**Target User:** Builders and Coaches/Creators

**Included:**
- Everything in Pro
- ✅ **Create unlimited coaches** — build for any purpose
- ✅ **Share via link** — anyone can use your coaches
- ✅ **Analytics** — see opens and session counts
- ✅ **Early access** — new features first
- ✅ **Coach templates** — starting points for creation

**Why This Price:** $9.99 is still accessible but creates meaningful segmentation. The $5 gap from Pro is small enough that serious builders will upgrade.

---

### Revenue Projections (Hypothetical)

| Tier | % of Users | Monthly Revenue per 1000 Users |
|------|------------|-------------------------------|
| Free | 70% | $0 |
| Pro | 25% | $1,247.50 |
| Creator | 5% | $499.50 |
| **Total** | 100% | **$1,747/month** |

---

## 8. User Flows

### 8.1 First Launch (New User)

```
App Launch
    ↓
Welcome Screen
    ↓
Intent Selection: "What brings you here?"
    • I want coaching → [Seeker Flow]
    • I want to build → [Builder Flow]
    • Both → [Builder Flow with coaching emphasis]
    ↓
Personal Context: Name, working on, biggest goal
    ↓
Coaching Style: Gentle / Balanced / Direct
    ↓
Home Screen (personalized based on intent)
```

### 8.2 Seeker Flow

```
Seeker Home
    ↓
Browse Coach Library OR tap "Continue Session"
    ↓
Coach Detail → "Start Session"
    ↓
Chat Screen
    ↓
End Session → Session Summary (Pro)
    ↓
Back to Home
    ↓
[If hits message limit] → Pro Paywall
```

### 8.3 Builder Flow

```
Builder Home (Creator Dashboard)
    ↓
"Create New Coach" OR manage existing coaches
    ↓
Create Coach Screen
    ↓
Fill: Icon, Name, Description, Instructions
    ↓
Toggle: Share this coach
    ↓
"Create Coach"
    ↓
Coach added to My Coaches
    ↓
[If sharing] → Get shareable link
    ↓
[If not Creator tier] → Creator Paywall
```

### 8.4 Shared Coach Import

```
User receives shared link
    ↓
Opens CoachKit (or App Store if not installed)
    ↓
Shared Coach Import Screen
    • Coach icon, name, description
    • Who shared it
    • "Add to My Coaches" button
    ↓
Coach added to user's library
    ↓
Can start session immediately
```

### 8.5 Paywall Triggers

| Trigger | Paywall Shown |
|---------|---------------|
| Seeker hits 5 messages/day | Pro Paywall |
| Seeker taps "Create Coach" | Creator Paywall |
| Builder taps "Create Coach" (on Free) | Creator Paywall |
| Builder tries to share (on Pro) | Creator Paywall |
| Any user taps "Upgrade" | Tier Comparison Screen |

---

## 9. Screen-by-Screen Specification

### Onboarding Screens

#### Screen 1: Welcome
- App logo (C in rounded square)
- "CoachKit" title
- Tagline: "Your pocket team of AI coaches. Get guidance. Build coaches. Share them."
- Feature pills: "🎯 Focused coaching", "🛠️ Build your own", "🔗 Share with anyone"
- "Get Started" button
- Footer: "No account needed · Data stays on your device"

#### Screen 2: Intent Selection
- Progress bar (1/3)
- "What brings you here?"
- Three options (radio selection):
  - 🧭 **I want coaching** — "Get AI-powered guidance on goals, decisions, productivity, career, and more." [MOST POPULAR badge]
  - 🛠️ **I want to build** — "Create custom AI coaches and share them with your audience or clients."
  - ✨ **Both!** — "Get coached AND build your own coaches for others."
- "Continue" button

#### Screen 3: About You
- Progress bar (2/3)
- "About you"
- Subtitle: "Your coaches will use this to personalize every session."
- Form fields:
  - Your name (text input)
  - What are you working on? (multiline)
  - Biggest goal this year (multiline)
- "Continue" button

#### Screen 4: Coaching Style
- Progress bar (3/3)
- "Coaching style"
- Subtitle: "How do you prefer to be coached?"
- Three options (radio selection):
  - 🌱 **Gentle** — "Patient, encouraging. Guides you to your own answers."
  - ⚖️ **Balanced** — "Warm but direct. Support with healthy challenge." [DEFAULT]
  - ⚡ **Direct** — "Straight to it. No fluff. Challenges assumptions."
- "Start Coaching →" button

---

### Seeker Flow Screens

#### Screen 5: Seeker Home
**Header (gradient blue):**
- Greeting: "Good evening, [Name]"
- Subtitle: "Ready for a coaching session?"
- Streak badge (🔥 5)
- Stats row: Today (3/5 with progress ring), Sessions (12), Coaches (4)

**Content:**
- "Continue Session" card (if active session exists)
- "Quick Start" grid: Focus, Decide, Career, Mindset
- Upgrade banner (if Free): "2 messages left today · Upgrade to Pro"

**Tab Bar:** Home, Coaches, Profile

#### Screen 6: Pro Paywall
- Close button (✕)
- Logo with PRO badge
- "Unlimited Coaching"
- Subtitle: "No limits. Just results."
- Features list:
  - ∞ Unlimited messages
  - 🧠 Extended context
  - 📥 Export conversations
  - ⚡ Priority responses
- Pricing cards: Monthly ($4.99) | Yearly ($39.99 — BEST VALUE, Save 33%)
- Link: "Want to create coaches? See Creator plan →"
- "Start 7-Day Free Trial" button
- Footer: "Cancel anytime · Restore purchase"

---

### Builder Flow Screens

#### Screen 7: Builder Home
**Header (gradient purple):**
- Greeting: "Welcome back, [Name]"
- Subtitle: "Creator Dashboard"
- CREATOR badge
- Stats row: Coaches Built (3), Link Opens (47), Sessions (156)

**Content:**
- "Create New Coach" CTA card (prominent)
- "My Coaches" list:
  - Each coach shows: icon, name, share status, opens count
  - Chevron to edit/view

**Tab Bar:** Home, Library, Create, Profile

#### Screen 8: Creator Paywall
- Close button (✕)
- Logo with CREATOR badge (purple)
- "Build & Share Coaches"
- Subtitle: "For creators, coaches, and power users."
- Features list:
  - ✦ Create unlimited coaches
  - 🔗 Share via link
  - 📊 Analytics
  - ∞ Unlimited messages (everything in Pro)
- Pricing cards: Monthly ($9.99) | Yearly ($79.99 — BEST VALUE)
- Link: "Just want coaching? See Pro plan →"
- "Start 7-Day Free Trial" button

---

### Shared Screens

#### Screen 9: Coach Library
- Header: "Coaches" title, search icon
- Filter tabs: All, Productivity, Career, Mindset, Creative
- "Built-in" section: 6 pre-built coaches (cards)
- "My Coaches" section: user-created coaches (if any)
- "Community" section: placeholder for future

#### Screen 10: Coach Detail
**Hero (gradient with coach color):**
- Back button
- Coach icon (large)
- Coach name
- Tagline
- Stats row: Sessions, Avg. length, Streak

**Content:**
- "About" section
- "What to expect" bullet points
- "Try asking" example prompts (tappable)

**Footer:**
- "Start Session" button (coach color)

#### Screen 11: Chat
**Header:**
- Back button
- Coach icon and name
- "Active" status indicator
- "New ↻" button

**Messages:**
- Coach messages (left, with avatar)
- User messages (right, accent color)
- Timestamps

**Input:**
- Text field with placeholder "Message..."
- Send button
- (Free tier) "3 of 5 free messages · Upgrade" text

#### Screen 12: Create Coach
- Back button
- "Create a Coach" title
- Form:
  - Icon picker (emoji grid)
  - Name (text input)
  - Description (text input)
  - Instructions (multiline — "What should this coach do?")
- Share toggle: "Share this coach — Anyone with link can use it"
- "Create Coach" button

#### Screen 13: Shared Coach Import
- Coach icon (large)
- Coach name
- Description
- "Shared by" card: avatar, name, "via CoachKit link"
- "About" card: coach description
- "Add to My Coaches" button
- Footer: "Free to use · No account needed"

#### Screen 14: Tier Comparison
- Back button
- "Choose Your Plan" title
- Three plan cards stacked:
  - **Free** ($0): features list
  - **Pro** ($4.99/mo): features list, POPULAR badge
  - **Creator** ($9.99/mo): features list, ✦ badge
- Footer: "All plans include 7-day free trial · Cancel anytime"

#### Screen 15: Profile / My Context
**Header (gradient):**
- Avatar (initial)
- Name
- Tier badge (Free / Pro / Creator)

**Content:**
- "My Context" section:
  - Working on (editable)
  - Biggest goal (editable)
  - Role (editable)
- "Values" section: chip/tag selector
- "Style" section: Gentle / Balanced / Direct toggle

**Tab Bar:** (appropriate for user type)

#### Screen 16: Session Summary
- Coach icon and name
- Session date/time
- "Summary" section (3 sentences)
- "Action Items" section (checkable list)
- "Key Insight" section (highlighted quote/reframe)
- "Share" button
- "New Session" button

---

## 10. Technical Architecture

### Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | React Native + Expo | Cross-platform, fast iteration, you know it |
| Language | TypeScript | Type safety, better DX |
| Navigation | React Navigation (expo-router) | Native feel, deep linking |
| State | React Context + useReducer | Simple, no extra dependencies |
| Storage | AsyncStorage | Local persistence, offline-first |
| AI | Google Gemini API | Free tier (15 RPM, 1M tokens/day) |
| Monetization | RevenueCat SDK | Required for hackathon |
| Notifications | Expo Notifications | Push notifications for proactive coaching |

### Why No Backend Server?

- Gemini API can be called directly from app
- All user data stored locally (AsyncStorage)
- Shared coaches use encoded URL params (no database needed)
- RevenueCat handles subscription state
- Dramatically simplifies development for solo dev

### Project Structure

```
coachkit/
├── app/                      # Expo Router screens
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── intent.tsx
│   │   ├── context.tsx
│   │   └── style.tsx
│   ├── (seeker)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Home
│   │   ├── coaches.tsx
│   │   └── profile.tsx
│   ├── (builder)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Dashboard
│   │   ├── library.tsx
│   │   ├── create.tsx
│   │   └── profile.tsx
│   ├── coach/
│   │   ├── [id].tsx          # Coach detail
│   │   └── chat.tsx          # Chat screen
│   ├── paywall/
│   │   ├── pro.tsx
│   │   └── creator.tsx
│   ├── shared/
│   │   └── [coachData].tsx   # Shared coach import
│   └── _layout.tsx           # Root layout
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── TabBar.tsx
│   │   └── ...
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── coaches/
│   │   ├── CoachCard.tsx
│   │   ├── CoachDetail.tsx
│   │   └── CoachIcon.tsx
│   └── paywall/
│       ├── FeatureList.tsx
│       └── PricingCard.tsx
├── services/
│   ├── ai.ts                 # Gemini API integration
│   ├── storage.ts            # AsyncStorage wrapper
│   ├── revenuecat.ts         # RevenueCat integration
│   └── notifications.ts      # Push notifications
├── hooks/
│   ├── useUserContext.ts
│   ├── useCoaches.ts
│   ├── useChat.ts
│   ├── useSubscription.ts
│   └── useOnboarding.ts
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── coaches.ts            # Pre-built coach definitions
│   └── templates.ts          # Coaching session templates
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── prompts.ts            # System prompt builders
│   └── sharing.ts            # Coach sharing utilities
└── app.json                  # Expo config
```

### Key Implementation Details

#### Gemini API Integration

```typescript
// services/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function sendMessage(
  coachPrompt: string,
  userContext: UserContext,
  chatHistory: Message[],
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const systemPrompt = buildSystemPrompt(coachPrompt, userContext);
  
  const chat = model.startChat({
    history: chatHistory.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    systemInstruction: systemPrompt,
  });
  
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
```

#### Coach Sharing (URL-based, no backend)

```typescript
// utils/sharing.ts
import * as Linking from "expo-linking";
import { encode, decode } from "base-64";

export function generateShareLink(coach: CustomCoach): string {
  const data = {
    n: coach.name,
    d: coach.description,
    i: coach.icon,
    p: coach.instructions,
    c: coach.color,
    by: coach.creatorName,
  };
  const encoded = encode(JSON.stringify(data));
  return `coachkit://shared/${encoded}`;
}

export function parseShareLink(encoded: string): CustomCoach | null {
  try {
    const data = JSON.parse(decode(encoded));
    return {
      id: generateId(),
      name: data.n,
      description: data.d,
      icon: data.i,
      instructions: data.p,
      color: data.c,
      creatorName: data.by,
      isCustom: true,
      isShared: true,
    };
  } catch {
    return null;
  }
}
```

---

## 11. Data Models

### UserContext

```typescript
interface UserContext {
  // Required (from onboarding)
  name: string;
  currentFocus: string;
  biggestGoal: string;
  coachingStyle: "gentle" | "balanced" | "direct";
  userType: "seeker" | "builder" | "both";
  
  // Optional (extended context for Pro)
  role?: string;
  values?: string[];
  strengths?: string;
  struggles?: string;
  
  // Metadata
  createdAt: string;
  onboardingComplete: boolean;
}
```

### Coach

```typescript
interface Coach {
  id: string;
  name: string;
  icon: string;              // Emoji
  description: string;       // One-liner
  tagline: string;           // Short motivational phrase
  category: string;          // Productivity, Career, Mindset, etc.
  color: string;             // Hex color for accent
  systemPrompt: string;      // AI instructions
  examplePrompts: string[];  // "Try asking" suggestions
  
  // Custom coach fields
  isCustom: boolean;
  isShared?: boolean;
  creatorName?: string;
  shareLink?: string;
  
  // Analytics (Creator tier)
  opens?: number;
  sessions?: number;
}
```

### ChatSession

```typescript
interface ChatSession {
  id: string;
  coachId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  summary?: SessionSummary;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SessionSummary {
  summary: string;           // 3-sentence summary
  actionItems: string[];     // List of next steps
  keyInsight: string;        // Main takeaway
  generatedAt: string;
}
```

### Subscription State

```typescript
interface SubscriptionState {
  tier: "free" | "pro" | "creator";
  isActive: boolean;
  expiresAt?: string;
  
  // Usage tracking (Free tier)
  messagesToday: number;
  lastMessageDate: string;
}
```

### App State

```typescript
interface AppState {
  user: UserContext | null;
  subscription: SubscriptionState;
  coaches: Coach[];            // Built-in + custom
  sessions: ChatSession[];
  activeSessionId: string | null;
}
```

---

## 12. AI & Prompt Engineering

### System Prompt Structure

Every coach conversation uses a system prompt with this structure:

```
[COACH IDENTITY]
You are {coach.name}, {coach.description}.

[COACHING STYLE]
{Based on coach personality + user's style preference}

[USER CONTEXT]
About the person you're coaching:
- Name: {name}
- Currently working on: {currentFocus}
- Biggest goal: {biggestGoal}
- Role: {role}
- Values: {values}
- Strengths: {strengths}
- Struggles: {struggles}
- They prefer {coachingStyle} coaching.

[GUIDELINES]
- Reference their specific situation naturally
- Ask one question at a time
- Keep responses concise (2-3 paragraphs max)
- End with a clear next step or reflection question
- Never break character
- Never mention being an AI
```

### Pre-Built Coach Prompts

#### The Essentialist 🎯

```
You are The Essentialist, a calm, Socratic productivity coach inspired by 
the principles of essentialism and deep work. You help people identify 
what truly matters, eliminate distractions, and focus on the vital few 
rather than the trivial many.

Your coaching style is calm, thoughtful, and Socratic. You ask probing 
questions rather than giving direct answers. You help people think clearly 
about their priorities and make intentional choices about where to invest 
their limited time and energy.

Core principles you embody:
- Less but better
- Trade-offs are real — saying yes to one thing means saying no to another
- Clarity precedes action
- The disciplined pursuit of less

When coaching, you often ask:
- "What's the ONE thing that would make everything else easier?"
- "If you could only accomplish one thing today, what would it be?"
- "What are you doing that gives the illusion of progress but isn't essential?"
```

#### The Strategist ♟️

```
You are The Strategist, a direct, framework-driven decision coach. You use 
mental models and structured thinking to help people make better decisions 
and develop strategic clarity.

Your coaching style is direct and analytical. You introduce frameworks when 
helpful but keep explanations practical. You challenge assumptions and help 
people see situations from multiple angles.

Frameworks you draw from:
- First principles thinking
- Inversion (what would make this fail?)
- Second-order consequences
- Opportunity cost analysis
- Pre-mortem analysis

When coaching, you often:
- Break down complex decisions into components
- Ask "What would have to be true for this to work?"
- Explore both the best and worst case scenarios
- Push for specificity and measurable outcomes
```

#### Career Coach 🚀

```
You are The Career Coach, a warm but honest guide for professional growth. 
You help people navigate career decisions, negotiate effectively, and 
develop professionally.

Your coaching style balances empathy with directness. You understand that 
career decisions are emotional, but you keep focus on practical outcomes 
and concrete actions.

Areas you help with:
- Salary negotiation and promotion conversations
- Career pivots and transitions
- Interview preparation
- Professional development planning
- Navigating workplace dynamics

When coaching, you:
- Validate feelings but redirect to action
- Provide specific language for difficult conversations
- Challenge limiting beliefs about what's possible
- Push for research and preparation before big moves
```

#### The Writer ✍️

```
You are The Writer, an encouraging, craft-focused writing coach. You help 
people improve their writing, communication, and storytelling — whether 
for emails, presentations, or creative work.

Your coaching style is encouraging but specific. You give actionable 
feedback, not just praise. You believe good writing is rewriting, and 
you help people develop their own voice.

Principles you teach:
- Clarity is kindness
- Cut ruthlessly — every word must earn its place
- Start with the reader's need
- Show, don't tell
- Structure supports creativity

When coaching, you:
- Ask to see their writing before giving advice
- Offer specific suggestions, not vague encouragement
- Help identify their natural voice and strengthen it
- Break down writing problems into solvable components
```

#### Mindset Coach 🧘

```
You are The Mindset Coach, an empathetic guide for building mental 
resilience and clarity. You help people reframe challenges, manage stress, 
and develop inner strength.

Your coaching style is grounding and warm. You create space for people to 
process emotions while gently guiding them toward constructive perspectives.

Core approaches:
- Cognitive reframing
- Separating facts from stories
- Self-compassion practices
- Values clarification
- Stress response management

When coaching, you:
- Acknowledge emotions before problem-solving
- Help distinguish between what can and can't be controlled
- Offer reframes as possibilities, not prescriptions
- Encourage self-compassion without enabling avoidance
```

#### Accountability Partner 💪

```
You are The Accountability Partner, an energetic, no-nonsense coach for 
goals and habits. You help people stay on track, call out excuses, and 
celebrate wins.

Your coaching style is direct, energetic, and encouraging. You balance 
tough love with genuine celebration of progress. You don't accept vague 
commitments — you push for specifics.

Core principles:
- Specificity creates accountability
- Small consistent actions beat big inconsistent ones
- Excuses are data, not verdicts
- Celebrate progress, not just outcomes

When coaching, you:
- Ask for specific, measurable commitments
- Follow up on previous commitments
- Call out patterns of avoidance (kindly but directly)
- Celebrate wins enthusiastically
- Help troubleshoot when things go off track
```

### Session Summary Prompt

```
Based on this coaching conversation, generate a session summary with exactly this JSON structure:

{
  "summary": "A 3-sentence summary of what was discussed and any decisions or realizations made.",
  "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "keyInsight": "The single most important insight or reframe from this session."
}

Guidelines:
- Action items should be specific and actionable (not vague)
- The key insight should be something the person can remember and apply
- Keep everything concise and practical
```

---

## 13. RevenueCat Integration

### Setup Requirements

1. Create RevenueCat account
2. Set up Google Play app in RevenueCat dashboard
3. Create products:
   - `coachkit_pro_monthly` — $4.99
   - `coachkit_pro_yearly` — $39.99
   - `coachkit_creator_monthly` — $9.99
   - `coachkit_creator_yearly` — $79.99
4. Create entitlements:
   - `pro` — unlocks Pro features
   - `creator` — unlocks Creator features (includes Pro)
5. Create offerings with both monthly and yearly options

### Implementation

```typescript
// services/revenuecat.ts
import Purchases, { 
  PurchasesOffering,
  CustomerInfo 
} from "react-native-purchases";

const API_KEY = "your_revenuecat_api_key";

export async function initializePurchases() {
  Purchases.configure({ apiKey: API_KEY });
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(packageId: string): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      p => p.identifier === packageId
    );
    if (pkg) {
      await Purchases.purchasePackage(pkg);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function checkSubscription(): Promise<SubscriptionState> {
  const customerInfo = await Purchases.getCustomerInfo();
  
  const hasCreator = customerInfo.entitlements.active["creator"];
  const hasPro = customerInfo.entitlements.active["pro"];
  
  return {
    tier: hasCreator ? "creator" : hasPro ? "pro" : "free",
    isActive: hasCreator || hasPro,
    expiresAt: hasCreator?.expirationDate || hasPro?.expirationDate,
  };
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}
```

### Entitlement Checks

```typescript
// hooks/useSubscription.ts
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: "free",
    isActive: false,
  });
  
  // Check on mount and when app returns to foreground
  useEffect(() => {
    checkSubscription().then(setSubscription);
    
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      // Update subscription state when it changes
      checkSubscription().then(setSubscription);
    });
    
    return () => listener.remove();
  }, []);
  
  const canSendMessage = useCallback(() => {
    if (subscription.tier !== "free") return true;
    // Check daily message limit for free tier
    return subscription.messagesToday < 5;
  }, [subscription]);
  
  const canCreateCoach = useCallback(() => {
    return subscription.tier === "creator";
  }, [subscription]);
  
  const canShareCoach = useCallback(() => {
    return subscription.tier === "creator";
  }, [subscription]);
  
  return {
    subscription,
    canSendMessage,
    canCreateCoach,
    canShareCoach,
  };
}
```

---

## 14. Design System

### Colors

```typescript
export const COLORS = {
  // Backgrounds
  bg: "#F2F3F7",
  card: "#FFFFFF",
  
  // Text
  text: "#1A1D2E",
  textSecondary: "#6B7082",
  textMuted: "#A0A4B8",
  
  // Accent (Seeker/Pro)
  accent: "#3B5BDB",
  accentLight: "#EDF2FF",
  accentDark: "#2B4299",
  
  // Creator (Builder)
  purple: "#7C3AED",
  purpleLight: "#F3EFFE",
  
  // Status
  success: "#2B9E5A",
  successLight: "#E8F8EF",
  error: "#E53E3E",
  
  // Misc
  border: "#E8EAF0",
  
  // Header gradients
  seekerGradient: ["#1E2A5E", "#3B5BDB"],
  builderGradient: ["#4C1D95", "#7C3AED"],
};
```

### Typography

```typescript
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Body
  body: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: "400",
  },
  
  // UI
  button: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  caption: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
};
```

### Spacing

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Border Radius

```typescript
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
```

### Component Patterns

**Cards:**
- Background: white
- Border: 1px solid border color
- Border radius: 16px
- Padding: 14-16px
- Shadow: 0 2px 10px rgba(0,0,0,0.04)

**Buttons (Primary):**
- Background: accent gradient
- Text: white, 16px, bold
- Border radius: 14-16px
- Padding: 15px vertical
- Shadow: 0 4px 16px accent/30

**Input Fields:**
- Background: bg color
- Border: 1.5px solid border color
- Border radius: 14px
- Padding: 13px 16px
- Focus: accent border

---

## 15. Build Timeline

### Day 1 (Feb 6): Foundation
- [x] Create concept document
- [x] Design wireframes
- [ ] Set up Expo project with TypeScript
- [ ] Install dependencies
- [ ] Create navigation structure
- [ ] Set up RevenueCat dashboard

### Day 2 (Feb 7): Core Data & Onboarding
- [ ] Build data models and storage service
- [ ] Create 6 coach definitions with system prompts
- [ ] Build onboarding flow (4 screens)
- [ ] Implement user context storage

### Day 3 (Feb 8): Coach Library & Detail
- [ ] Build Seeker home screen
- [ ] Build Builder home screen
- [ ] Build coach library screen
- [ ] Build coach detail screen
- [ ] Style everything with design system

### Day 4 (Feb 9): Chat — The Core
- [ ] Build chat UI
- [ ] Integrate Gemini API
- [ ] Implement system prompt injection
- [ ] Chat history persistence
- [ ] Typing indicator, error handling
- [ ] Test all 6 coaches

### Day 5 (Feb 10): Monetization & Pro Features
- [ ] Integrate RevenueCat SDK
- [ ] Build Pro paywall
- [ ] Build Creator paywall
- [ ] Implement free tier limits
- [ ] Build Create Coach screen
- [ ] Implement coach sharing (URL encoding)

### Day 6 (Feb 11): Polish & Testing
- [ ] Session summaries feature
- [ ] Profile/context screen
- [ ] Settings screen
- [ ] App icon and splash screen
- [ ] End-to-end testing
- [ ] Upload to Google Play Internal Testing
- [ ] Recruit testers

### Day 7 (Feb 12): Submit
- [ ] Record demo video (<3 minutes)
- [ ] Write submission proposal
- [ ] Write technical documentation
- [ ] Final testing
- [ ] Submit on Devpost before 11:45 PM ET

---

## 16. Submission Requirements

### Required Materials

1. **Working App Access**
   - Google Play Internal Testing link
   - Add judges as testers

2. **Demo Video** (under 3 minutes)
   - Show app on real device
   - Cover: problem, solution, key features, monetization
   - Upload to YouTube (unlisted is fine)

3. **Written Proposal**
   - App description and features
   - How it fits Simon's brief
   - Target audience and use cases
   - Monetization strategy

4. **Technical Documentation**
   - Tech stack overview
   - Architecture decisions
   - Third-party services used
   - How RevenueCat is integrated

5. **Developer Bio**
   - Background
   - Why you built this
   - Contact information

### Demo Video Structure (Recommended)

| Time | Section | Content |
|------|---------|---------|
| 0:00-0:15 | Hook | "What if you had expert coaches in your pocket, anytime?" |
| 0:15-0:35 | Problem | Coaching is expensive, AI feels generic and complicated |
| 0:35-0:50 | Solution | CoachKit — specialized AI coaches that know you |
| 0:50-2:20 | Demo | Walk through app: onboarding → coaching → create → share |
| 2:20-2:40 | Monetization | Show paywalls, explain 3-tier model |
| 2:40-3:00 | Close | "Built for Simon's audience — productivity lovers who want results" |

---

## 17. Success Metrics

### Judging Criteria Alignment

| Criterion | Weight | How CoachKit Delivers |
|-----------|--------|----------------------|
| Audience Fit | 30% | Mirrors Simon's AgentOS. Three user types mapped to his community. |
| User Experience | 25% | Minimal design, zero friction, personalized flows. |
| Monetization | 20% | Three-tier model with clear value at each level. |
| Innovation | 15% | Intent-based onboarding, specialized coaches with context, sharing. |
| Technical Quality | 10% | Simple architecture, local-first, reliable AI integration. |

### Post-Submission Success Metrics (if launched)

- **Activation:** % completing onboarding
- **Engagement:** Sessions per user per week
- **Retention:** 7-day and 30-day retention
- **Conversion:** Free → Pro, Pro → Creator
- **Sharing:** Coaches shared, shared coach imports
- **Revenue:** MRR, ARPU

---

## Appendix A: Competitive Landscape

| App | What It Does | How CoachKit Differs |
|-----|--------------|---------------------|
| ChatGPT | General AI assistant | Specialized coaches, personal context, minimal UI |
| Character.AI | AI characters to chat with | Coaching-focused, actionable outcomes, sharing |
| Replika | AI companion | Professional use case, productivity focus |
| BetterUp | Human coaching platform | AI-powered, accessible price point |
| Notion AI | AI in productivity tool | Standalone app, mobile-first, focused experience |

---

## Appendix B: Future Roadmap

### Version 1.1
- Community coach library (browse and discover)
- Proactive coaching notifications
- Coach remix (fork and customize)

### Version 1.2
- Voice mode
- Progress tracking and insights
- Export to Notion

### Version 2.0
- Multi-coach conversations
- Team/organization plans
- Coach monetization (creators earn from usage)

---

*Document created for RevenueCat Shipyard Creator Contest 2026*
*Builder: Iqbal (Pakistan)*
*Target Brief: Simon / BetterCreating*
