import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../types';
import { getUser, saveUser } from '../services/storage';

interface UserState {
  user: UserContext | null;
  isLoading: boolean;
  updateUser: (updates: Partial<UserContext>) => Promise<void>;
  setUser: (user: UserContext) => Promise<void>;
}

const UserCtx = createContext<UserState>({
  user: null,
  isLoading: true,
  updateUser: async () => {},
  setUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUser().then(u => {
      setUserState(u);
      setIsLoading(false);
    });
  }, []);

  const setUser = useCallback(async (newUser: UserContext) => {
    setUserState(newUser);
    await saveUser(newUser);
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserContext>) => {
    setUserState(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveUser(updated);
      return updated;
    });
  }, []);

  return (
    <UserCtx.Provider value={{ user, isLoading, updateUser, setUser }}>
      {children}
    </UserCtx.Provider>
  );
}

export function useUser() {
  return useContext(UserCtx);
}
