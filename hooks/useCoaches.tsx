import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Coach } from '../types';
import { BUILT_IN_COACHES } from '../constants/coaches';
import { getCustomCoaches, saveCustomCoach, deleteCustomCoach as deleteCoachStorage } from '../services/storage';

interface CoachState {
  allCoaches: Coach[];
  builtInCoaches: Coach[];
  customCoaches: Coach[];
  isLoading: boolean;
  addCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (coachId: string) => Promise<void>;
  getCoachById: (id: string) => Coach | undefined;
}

const CoachCtx = createContext<CoachState>({
  allCoaches: [],
  builtInCoaches: BUILT_IN_COACHES,
  customCoaches: [],
  isLoading: true,
  addCoach: async () => {},
  deleteCoach: async () => {},
  getCoachById: () => undefined,
});

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [customCoaches, setCustomCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCustomCoaches().then(coaches => {
      setCustomCoaches(coaches);
      setIsLoading(false);
    }).catch(err => {
      console.error('Failed to load custom coaches:', err);
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

  return (
    <CoachCtx.Provider value={{
      allCoaches,
      builtInCoaches: BUILT_IN_COACHES,
      customCoaches,
      isLoading,
      addCoach,
      deleteCoach,
      getCoachById,
    }}>
      {children}
    </CoachCtx.Provider>
  );
}

export function useCoaches() {
  return useContext(CoachCtx);
}
