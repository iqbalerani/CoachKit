import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, Message, Coach } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

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

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const chatHistory = history.map(m => ({
    role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history: chatHistory,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function generateSessionSummary(
  messages: Message[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const conversation = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Based on this coaching conversation, generate a session summary with exactly this JSON structure:

{
  "summary": "A 3-sentence summary of what was discussed and any decisions or realizations made.",
  "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "keyInsight": "The single most important insight or reframe from this session."
}

Conversation:
${conversation}

Respond ONLY with the JSON object, no other text.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
