# CoachKit — AI Coaching That Actually Knows You

## The Problem

Personal coaching works. It's one of the most effective ways to build better habits, make clearer decisions, and grow professionally. But it costs $150-500/hour, putting it out of reach for most people.

AI chatbots offer a cheap alternative, but they fail at coaching for two reasons: they have no memory of who you are, and they have no specialized methodology. Every conversation starts from zero. The result is generic advice that feels like talking to a search engine — not a coach who knows your goals, challenges, and progress over time.

## The Solution

CoachKit is a mobile app that delivers personalized AI coaching through specialized coaches that remember your context.

During onboarding, users share their goals, current challenges, and preferred coaching style. This context is injected into every conversation, so each coach responds with awareness of who you are and what you're working toward — not generic platitudes.

The app ships with **six expert coaches**, each built on proven methodologies:

- **The Essentialist** — Focus and priorities via essentialism and deep work principles
- **The Strategist** — Decision-making powered by first principles and mental models
- **Career Coach** — Professional growth with negotiation tactics and the STAR method
- **The Writer** — Writing craft through storytelling structure and clarity frameworks
- **Mindset Coach** — Resilience through cognitive reframing and stoic philosophy
- **Accountability Partner** — Habit-building with atomic habits and implementation intentions

These aren't chatbot skins with different names. Each coach has a distinct personality, methodology, and conversational style that shapes every response.

## Target Audience

**Primary: Productivity-focused professionals (25-45).** People who read books like *Atomic Habits* and *Deep Work*, listen to podcasts about personal development, and are willing to pay for tools that help them perform better. They've tried generic AI chat and found it unsatisfying for sustained personal growth.

**Secondary: Coaches and consultants who want to scale.** Using CoachKit's Builder mode, coaches can create custom AI coaches that encode their methodology and share them with clients — extending their reach beyond 1:1 sessions. The coach marketplace lets them publish and distribute their creations.

**Tertiary: Solopreneurs and creators** who need quick, expert-level input across multiple domains (career decisions, writing feedback, habit accountability) without hiring separate coaches for each.

## Key Features

- **Personalized onboarding** — Users define their goals, context, and preferred coaching style, which persists across all conversations
- **Specialized AI coaches** — Six built-in coaches with distinct methodologies, not a single generic chatbot
- **Coach creation and sharing** — Build custom coaches with your own system prompts and share them via deep links or the marketplace
- **Notion integration** — Connect your Notion workspace for richer coaching context
- **Session history** — Full conversation persistence so coaches can reference past discussions
- **Two-mode experience** — Seekers browse and chat with coaches; Builders create, publish, and manage their coaching library

## Monetization Strategy

CoachKit uses RevenueCat for subscription management with a three-tier model:

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | $0 | 50 messages/day, all 6 built-in coaches, full onboarding personalization |
| **Pro** | $4.99/mo | Unlimited messages, extended conversation context, session summaries |
| **Creator** | $9.99/mo | Everything in Pro + create custom coaches, share via deep links, marketplace publishing |

The free tier is generous enough to deliver real value and demonstrate the quality gap between CoachKit and generic chatbots. The conversion path is natural: users hit the daily limit mid-conversation with a coach they've built a rapport with, and upgrading removes the friction. Creator tier targets the smaller but higher-value segment of users who want to build and distribute their own coaches.

**Why this works for RevenueCat:** The tiered model exercises RevenueCat's subscription management, entitlement checking, paywall presentation (via RevenueCatUI), and Customer Center — demonstrating a real-world integration, not a toy example.

## Technical Architecture

- **React Native + Expo 54** — Cross-platform from a single codebase, managed workflow
- **Google Gemini API** (gemini-2.0-flash) — Fast, cost-effective AI responses with dynamic system prompts assembled per-conversation
- **RevenueCat SDK** — Subscription management, paywall UI, entitlement checks, and customer center
- **Local-first storage** — AsyncStorage for data, Expo SecureStore for secrets. No backend server to maintain, scale, or pay for
- **Expo Router** — File-based routing with type-safe navigation

**The "no backend" sharing model** is a deliberate architectural choice: coach definitions are Base64-encoded into deep link URLs (`coachkit://shared/{base64}`). Users can share coaches via any messaging app — no server, no database, no user accounts required for sharing. This keeps infrastructure costs at zero while enabling viral distribution.

## What Makes CoachKit Different

CoachKit is not a ChatGPT wrapper with a coaching prompt. The differences are structural:

1. **Context persistence** — Your goals, challenges, and coaching preferences travel with you across every session
2. **Methodology-driven coaches** — Each coach is built on real frameworks (essentialism, cognitive reframing, atomic habits), not vague instructions to "be helpful"
3. **Zero-infrastructure sharing** — Coach sharing works through URLs, not a social network. No accounts, no servers, no moderation overhead
4. **Creator economy built in** — The Builder experience turns users into coach creators, adding supply to the marketplace without any operational cost
5. **Honest free tier** — 50 messages/day is enough to genuinely evaluate the product, not a crippled trial designed to frustrate

---

*Built for the RevenueCat Shipyard Creator Contest by Iqbal Erani. React Native + Expo, powered by Gemini AI and RevenueCat.*
