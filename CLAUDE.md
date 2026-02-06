# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoachKit is a React Native + Expo mobile app — a personalized AI coaching platform built for the RevenueCat Shipyard Creator Contest (deadline Feb 12, 2026). Users pick from pre-built AI coaches or create their own, then chat for personalized coaching. No backend server; everything is local storage + direct API calls.

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator/device
npm run ios            # Run on iOS simulator (Mac only)
npm run web            # Run web preview
npx tsc --noEmit       # Type-check without emitting
```

No test runner or linter is configured yet.

## Tech Stack

- **Runtime:** React Native 0.81.5 + Expo 54 (managed workflow, new architecture enabled)
- **Language:** TypeScript 5.9 (strict mode, extends `expo/tsconfig.base`)
- **Routing:** Expo Router 6 (file-based, screens auto-discovered from `app/` directory)
- **AI:** Google Gemini API via `@google/generative-ai` (model: `gemini-2.0-flash`)
- **Payments:** RevenueCat via `react-native-purchases`
- **Storage:** `@react-native-async-storage/async-storage` for data, `expo-secure-store` for secrets

## Architecture

**Data flow:** Components → Custom Hooks → Services → AsyncStorage / External APIs

- **No backend server.** The app calls Gemini API directly and uses RevenueCat SDK for subscriptions.
- **Coach sharing** works without a database — coach data is Base64-encoded into deep link URLs (`coachkit://shared/{base64}`), decoded on import.
- **State management** uses React Context for global state, with AsyncStorage for persistence.

### Storage Keys

| Key | Type | Contents |
|-----|------|----------|
| `coachkit_user` | `UserContext` | Name, goals, coaching style, user type |
| `coachkit_coaches` | `Coach[]` | Custom/imported coaches |
| `coachkit_sessions` | `ChatSession[]` | Full chat history |
| `coachkit_subscription` | `SubscriptionState` | Tier + daily message count |

### Routing Structure (Expo Router)

```
app/
├── _layout.tsx                  # Root layout
├── (onboarding)/               # Onboarding flow (stack)
│   ├── welcome.tsx / intent.tsx / context.tsx / style.tsx
├── (main)/                     # Main tabs (conditional on user type)
│   ├── index.tsx / coaches.tsx / create.tsx / profile.tsx
├── coach/
│   ├── [id].tsx                # Coach detail (dynamic route)
│   └── chat.tsx                # Chat screen
├── paywall/
│   ├── pro.tsx / creator.tsx
└── shared/
    └── [data].tsx              # Deep link coach import
```

### Service Layer

- `services/ai.ts` — Gemini API calls; injects dynamic system prompt (coach identity + user context + coaching style)
- `services/storage.ts` — Typed AsyncStorage wrapper
- `services/revenuecat.ts` — Subscription tier management and entitlement checks

### Monetization Tiers

- **Free:** 5 messages/day, built-in coaches only
- **Pro ($4.99/mo):** Unlimited messages, extended context, session summaries
- **Creator ($9.99/mo):** Create/share custom coaches, analytics

## Key Conventions

- **Folder naming:** Route groups use parentheses — `(onboarding)`, `(main)`
- **Components:** PascalCase filenames (`CoachCard.tsx`, `ChatBubble.tsx`)
- **Services/hooks:** camelCase (`ai.ts`, `useChat.ts`)
- **Coaches:** 6 pre-built coaches defined in `constants/coaches.ts`, each with emoji icon, hex color, category, system prompt, and example prompts
- **System prompts:** Dynamically assembled per conversation from coach definition + user context; passed as `systemInstruction` to Gemini

## Reference Documentation

- `CLAUDE_BUILD_GUIDE.md` — Step-by-step build instructions with file-by-file prompts and build phases
- `CoachKit_Architecture (1).md` — Complete product spec: 16 screen specifications, data models, TypeScript interfaces, design system (colors/typography/spacing), user flows, RevenueCat integration guide
- `CoachKit_Wireframe_V3.jsx` — Interactive wireframe mockups for all screens with theme constants

## Design System

```
Background: #F2F3F7    Card: #FFFFFF       Text: #1A1D2E
Seeker accent: #3B5BDB (blue)             Builder accent: #7C3AED (purple)
Success: #2B9E5A      Error: #E53E3E
```

## Build Phases

1. Onboarding screens (welcome → intent → context → style)
2. Main tabs + coach library
3. Chat screen with Gemini integration
4. Pro features + RevenueCat paywall
5. Coach creation + sharing (deep links)
6. Polish, testing, submission assets
