import { useState, useCallback, useRef } from 'react';
import { Message, ChatSession, Coach } from '../types';
import { sendMessage as sendAIMessage } from '../services/ai';
import { saveSession, getSessionByCoach } from '../services/storage';
import { useUser } from './useUser';

export function useChat(coach: Coach | undefined) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const sessionRef = useRef<ChatSession | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadSession = useCallback(async (coachId: string) => {
    const existing = await getSessionByCoach(coachId);
    if (existing) {
      setSession(existing);
      sessionRef.current = existing;
      setMessages(existing.messages);
    } else {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        coachId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSession(newSession);
      sessionRef.current = newSession;
      setMessages([]);
    }
  }, []);

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!coach || !user || !sessionRef.current) return false;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await sendAIMessage(coach, user, messages, text);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      const allMessages = [...updatedMessages, assistantMessage];
      setMessages(allMessages);

      const updatedSession: ChatSession = {
        ...sessionRef.current,
        messages: allMessages,
        updatedAt: new Date().toISOString(),
      };
      setSession(updatedSession);
      sessionRef.current = updatedSession;
      await saveSession(updatedSession);

      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      // Remove the optimistic user message on failure
      setMessages(messages);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [coach, user, messages]);

  const startNewSession = useCallback(async () => {
    if (!coach) return;
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      coachId: coach.id,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSession(newSession);
    sessionRef.current = newSession;
    setMessages([]);
  }, [coach]);

  return {
    messages,
    isLoading,
    error,
    clearError,
    session,
    sendMessage,
    loadSession,
    startNewSession,
  };
}
