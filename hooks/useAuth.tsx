import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession } from '../types';
import * as authService from '../services/auth';
import { setCurrentUserId } from '../services/storage';

interface AuthState {
  session: AuthSession | null;
  isAuthLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({
  session: null,
  isAuthLoading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    authService.getActiveSession().then(s => {
      if (s) {
        setCurrentUserId(s.userId);
      }
      setSession(s);
      setIsAuthLoading(false);
    });
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const s = await authService.signUp(email, password);
    setCurrentUserId(s.userId);
    setSession(s);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const s = await authService.signIn(email, password);
    setCurrentUserId(s.userId);
    setSession(s);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setCurrentUserId(null);
    setSession(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ session, isAuthLoading, signUp, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
