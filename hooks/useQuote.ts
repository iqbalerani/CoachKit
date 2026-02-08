import { useState, useEffect, useCallback } from 'react';
import { Coach } from '../types';
import { getCachedQuote, saveCachedQuote } from '../services/storage';
import { generateMotivationalQuote } from '../services/ai';
import { useUser } from './useUser';

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const FALLBACK_QUOTE = 'Every step forward counts, even the small ones. Keep going.';

export function useQuote(enrolledCoaches: Coach[]) {
  const { user } = useUser();
  const [quote, setQuote] = useState<string>(FALLBACK_QUOTE);
  const [isLoading, setIsLoading] = useState(true);

  const enrolledIds = enrolledCoaches.map(c => c.id).sort().join(',');

  const fetchQuote = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    setIsLoading(true);

    try {
      if (!forceRefresh) {
        const cached = await getCachedQuote();
        if (cached) {
          const age = Date.now() - new Date(cached.generatedAt).getTime();
          const cachedIds = cached.enrolledCoachIds.sort().join(',');
          if (age < CACHE_DURATION_MS && cachedIds === enrolledIds) {
            setQuote(cached.text);
            setIsLoading(false);
            return;
          }
        }
      }

      const text = await generateMotivationalQuote(user, enrolledCoaches);
      setQuote(text);
      await saveCachedQuote({
        text,
        generatedAt: new Date().toISOString(),
        enrolledCoachIds: enrolledCoaches.map(c => c.id),
      });
    } catch {
      setQuote(FALLBACK_QUOTE);
    } finally {
      setIsLoading(false);
    }
  }, [user, enrolledCoaches, enrolledIds]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const refreshQuote = useCallback(() => {
    fetchQuote(true);
  }, [fetchQuote]);

  return { quote, isLoading, refreshQuote };
}
