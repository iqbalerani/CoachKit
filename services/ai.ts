import { UserContext, Message, Coach } from '../types';

// --- Provider config ---
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || 'google/gemini-2.0-flash';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const TIMEOUT_MS = 15_000; // 15s per provider (leaves room for fallback)

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// --- OpenRouter (primary) ---
async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response text from OpenRouter API');
    }
    return text;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenRouter request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// --- Gemini direct (fallback) ---
async function callGemini(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const body: Record<string, unknown> = {
    contents: conversationMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  };

  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map(m => m.content).join('\n\n') }],
    };
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response text from Gemini API');
    }
    return text;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Gemini request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// --- Wrapper: OpenRouter primary, Gemini fallback ---
async function callAI(messages: ChatMessage[]): Promise<string> {
  try {
    return await callOpenRouter(messages);
  } catch (openRouterError) {
    console.warn('[AI] OpenRouter failed, falling back to Gemini:', openRouterError);
    return callGemini(messages);
  }
}

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
${user.strengths ? `- Strengths: ${user.strengths}` : ''}
${user.struggles ? `- Struggles: ${user.struggles}` : ''}
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
  const systemPrompt = buildSystemPrompt(coach, user);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  return callAI(messages);
}

export async function generateSessionSummary(
  messages: Message[]
): Promise<string> {
  const conversation = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Based on this coaching conversation, generate a session summary with exactly this JSON structure:

{
  "title": "A short descriptive title for this session (5-10 words)",
  "summary": "A 3-sentence summary of what was discussed and any decisions or realizations made.",
  "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "keyInsight": "The single most important insight or reframe from this session.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "frameworks": ["Any coaching frameworks or mental models referenced"],
  "tags": ["topic1", "topic2"],
  "followUp": "A suggested follow-up question or action for the next session."
}

Conversation:
${conversation}

Respond ONLY with the JSON object, no other text.`;

  return callAI([{ role: 'user', content: prompt }]);
}

export async function generateMotivationalQuote(
  user: UserContext,
  enrolledCoaches: Coach[]
): Promise<string> {
  const coachContext = enrolledCoaches.length > 0
    ? `They are currently working with these coaches: ${enrolledCoaches.map(c => `${c.name} (${c.category})`).join(', ')}.`
    : 'They haven\'t enrolled in any coaches yet.';

  const prompt = `Generate a short, personalized motivational quote (1-2 sentences) for someone with this context:
- Name: ${user.name}
- Currently focused on: ${user.currentFocus}
- Biggest goal: ${user.biggestGoal}
${user.role ? `- Role: ${user.role}` : ''}
${coachContext}

The quote should feel personal and relevant to their situation. Do NOT use generic platitudes. Do NOT include quotation marks or attribution. Just return the quote text.`;

  const result = await callAI([{ role: 'user', content: prompt }]);
  return result.trim();
}

export async function parseWithAI(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  return callAI([
    { role: 'system', content: systemInstruction },
    { role: 'user', content: userPrompt },
  ]);
}
