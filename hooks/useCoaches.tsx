import { useState, useEffect, useCallback } from 'react';
import { Coach } from '../types';
import { BUILT_IN_COACHES } from '../constants/coaches';
import { getCustomCoaches, saveCustomCoach, deleteCustomCoach as deleteCoachStorage } from '../services/storage';

export function useCoaches() {
  const [customCoaches, setCustomCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCustomCoaches().then(coaches => {
      setCustomCoaches(coaches);
      setIsLoading(false);
    });
  }, []);

  const allCoaches = [...BUILT_IN_COACHES, ...customCoaches];

  const addCoach = useCallback(async (coach: Coach) => {
    await saveCustomCoach(coach);
    setCustomCoaches(prev => [...prev, coach]);
  }, []);

  const deleteCoach = useCallback(async (coachId: string) => {
    await deleteCoachStorage(coachId);
    setCustomCoaches(prev => prev.filter(c => c.id !== coachId));
  }, []);

  const getCoachById = useCallback((id: string): Coach | undefined => {
    return BUILT_IN_COACHES.find(c => c.id === id)
      || customCoaches.find(c => c.id === id);
  }, [customCoaches]);

  return {
    allCoaches,
    builtInCoaches: BUILT_IN_COACHES,
    customCoaches,
    isLoading,
    addCoach,
    deleteCoach,
    getCoachById,
  };
}
