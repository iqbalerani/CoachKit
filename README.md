# CoachKit

**Your AI coaching team, always in your pocket.**

[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![RevenueCat](https://img.shields.io/badge/RevenueCat-Powered-F2545B?logo=data:image/svg+xml;base64,&logoColor=white)](https://www.revenuecat.com)

Built for the [RevenueCat Shipyard Creator Contest](https://www.revenuecat.com/shipyard/)

---

## What is CoachKit?

CoachKit is a mobile AI coaching platform where users pick from expert AI coaches or create their own, then chat for personalized guidance. Each coach has a distinct personality, methodology, and coaching style -- from productivity and career growth to mindset and writing.

**For Seekers:** Browse coaches, enroll, and get personalized coaching through natural conversation.

**For Builders:** Create custom AI coaches with unique personalities, connect Notion for knowledge-enriched coaching, and publish to the marketplace.

## Features

- **6 Built-in AI Coaches** -- Expert coaches covering productivity, strategy, career, writing, mindset, and accountability
- **Custom Coach Creation** -- Build your own AI coach with custom personality, methodology, and system prompts
- **Notion Integration** -- Connect Notion pages to enrich coach knowledge with your own content
- **Coach Marketplace** -- Discover and enroll in community-created coaches
- **Coach Sharing** -- Share coaches via deep links (no backend needed -- coach data is Base64-encoded into URLs)
- **Personalized Context** -- Coaches adapt responses based on your goals, experience, and preferred coaching style
- **Session History** -- Full chat history with session summaries (Pro)
- **Dual User Modes** -- Seeker mode for coaching consumers, Builder mode for coach creators

## Screenshots

<!-- Add screenshots here -->
<!-- ![Home](./assets/screenshots/home.png) -->
<!-- ![Chat](./assets/screenshots/chat.png) -->

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | React Native 0.81 + Expo 54 (managed workflow) |
| Language | TypeScript 5.9 (strict mode) |
| Routing | Expo Router 6 (file-based) |
| AI | Google Gemini API (`gemini-2.0-flash`) via `@google/generative-ai` |
| Payments | RevenueCat via `react-native-purchases` |
| Storage | AsyncStorage for data, Expo SecureStore for secrets |
| Auth | Expo AuthSession |
| Animations | React Native Reanimated 4 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac) or Android emulator, or [Expo Go](https://expo.dev/go) on a physical device

### Installation

```bash
git clone https://github.com/your-username/coachkit.git
cd coachkit
npm install
```

### Environment Setup

CoachKit requires API keys for full functionality:

- **Google Gemini API Key** -- for AI coaching conversations
- **RevenueCat API Key** -- for subscription management
- **Notion OAuth credentials** -- for Notion integration (optional)

Store sensitive keys using Expo SecureStore (the app handles this through settings).

### Running the App

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run web preview
```

### Type Checking

```bash
npx tsc --noEmit
```

## Project Structure

```
CoachKit/
├── app/                        # Screens (Expo Router file-based routing)
│   ├── _layout.tsx             # Root layout
│   ├── index.tsx               # Entry point / router
│   ├── settings.tsx            # App settings
│   ├── (onboarding)/           # Onboarding flow
│   │   ├── welcome.tsx         # Welcome screen
│   │   ├── intent.tsx          # Seeker vs Builder selection
│   │   ├── context.tsx         # User context collection
│   │   └── style.tsx           # Coaching style preference
│   ├── (seeker)/               # Seeker tab navigation
│   │   ├── index.tsx           # Dashboard / home
│   │   ├── coaches.tsx         # Coach library
│   │   ├── enrollments.tsx     # Enrolled coaches
│   │   ├── notion.tsx          # Notion integration
│   │   └── profile.tsx         # User profile
│   ├── (builder)/              # Builder tab navigation
│   │   ├── index.tsx           # Builder dashboard
│   │   ├── create.tsx          # Coach creation
│   │   ├── library.tsx         # My coaches
│   │   ├── enrollments.tsx     # Enrollment analytics
│   │   ├── notion.tsx          # Notion integration
│   │   └── profile.tsx         # Builder profile
│   ├── (auth)/                 # Authentication screens
│   │   ├── sign-in.tsx         # Sign in
│   │   └── sign-up.tsx         # Sign up
│   ├── coach/
│   │   ├── [id].tsx            # Coach detail (dynamic route)
│   │   └── chat.tsx            # Chat screen
│   ├── marketplace/
│   │   ├── index.tsx           # Marketplace browse
│   │   └── [id].tsx            # Marketplace coach detail
│   ├── paywall/
│   │   ├── pro.tsx             # Pro subscription
│   │   └── creator.tsx         # Creator subscription
│   └── shared/
│       └── [data].tsx          # Deep link coach import
├── components/                 # Reusable UI components
├── constants/                  # App constants
│   ├── coaches.ts              # Built-in coach definitions
│   ├── colors.ts               # Design system colors
│   ├── config.ts               # App configuration
│   └── typography.ts           # Typography scale
├── hooks/                      # Custom React hooks
│   ├── useAuth.tsx             # Authentication state
│   ├── useChat.ts              # Chat logic & Gemini API
│   ├── useCoaches.tsx          # Coach management
│   ├── useEnrollments.ts       # Coach enrollment tracking
│   ├── useMarketplace.ts       # Marketplace interactions
│   ├── useNotion.ts            # Notion OAuth & API
│   ├── useNotionSync.ts        # Notion content sync
│   ├── useQuote.ts             # Daily quotes
│   ├── useSubscription.ts      # RevenueCat subscription
│   └── useUser.tsx             # User context & preferences
├── services/                   # External API integrations
│   ├── ai.ts                   # Gemini API (system prompt assembly)
│   ├── auth.ts                 # Authentication service
│   ├── marketplace.ts          # Marketplace API
│   ├── notion.ts               # Notion API integration
│   ├── revenuecat.ts           # Subscription management
│   └── storage.ts              # Typed AsyncStorage wrapper
├── types/                      # TypeScript type definitions
│   └── index.ts
├── utils/                      # Utility functions
│   └── sharing.ts              # Coach sharing (Base64 deep links)
└── assets/                     # Images, fonts, icons
```

## Architecture

```
Components → Custom Hooks → Services → AsyncStorage / External APIs
```

- **No backend server.** The app calls Gemini API directly and uses RevenueCat SDK for subscriptions.
- **Coach sharing** encodes coach data into Base64 deep link URLs (`coachkit://shared/{base64}`), decoded on import -- no database required.
- **State management** uses React Context with AsyncStorage persistence.
- **AI system prompts** are dynamically assembled per conversation from the coach definition + user context + coaching style.

## Built-in Coaches

| Coach | Category | Focus |
|-------|----------|-------|
| :dart: **The Essentialist** | Productivity | Focus & priorities using essentialism and deep work principles |
| :chess_pawn: **The Strategist** | Strategy | Decisions & frameworks powered by mental models |
| :rocket: **Career Coach** | Career | Growth & negotiation with proven career frameworks |
| :writing_hand: **The Writer** | Creative | Writing & storytelling craft for clarity and impact |
| :person_in_lotus_position: **Mindset Coach** | Mindset | Clarity & resilience through cognitive reframing |
| :flexed_biceps: **Accountability Partner** | Habits | Goals & follow-through with habit science |

## Monetization

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 5 messages/day, built-in coaches only |
| **Pro** | $4.99/mo | Unlimited messages, extended context, session summaries |
| **Creator** | $9.99/mo | Create & share custom coaches, analytics |

Powered by [RevenueCat](https://www.revenuecat.com) for subscription management.
