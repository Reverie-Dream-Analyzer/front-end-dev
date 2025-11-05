'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-provider';
import type { Dream } from './dream-entry';
import { INITIAL_DREAMS } from '@/lib/initial-dreams';

type DreamsContextValue = {
  dreams: Dream[];
  addDream: (dream: Dream) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  resetDreams: () => void;
  isLoaded: boolean;
};

const DreamsContext = createContext<DreamsContextValue | undefined>(undefined);

const getStorageKey = (email: string | undefined) =>
  email ? `reverie_dreams_${email}` : 'reverie_dreams_guest';

export function DreamsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => getStorageKey(user?.email), [user?.email]);
  const [dreams, setDreams] = useState<Dream[]>(INITIAL_DREAMS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    startTransition(() => {
      if (stored) {
        try {
          const parsed: Dream[] = JSON.parse(stored);
          setDreams(parsed);
        } catch (error) {
          console.warn('Unable to parse stored dreams, falling back to defaults.', error);
          setDreams(INITIAL_DREAMS);
        }
      } else {
        setDreams(INITIAL_DREAMS);
      }
      setIsLoaded(true);
    });
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(dreams));
  }, [dreams, isLoaded, storageKey]);

  const addDream = useCallback((dream: Dream) => {
    setDreams((prev) => [dream, ...prev]);
  }, []);

  const updateDream = useCallback((id: string, updates: Partial<Dream>) => {
    setDreams((prev) =>
      prev.map((dream) => (dream.id === id ? { ...dream, ...updates } : dream))
    );
  }, []);

  const deleteDream = useCallback((id: string) => {
    setDreams((prev) => prev.filter((dream) => dream.id !== id));
  }, []);

  const resetDreams = useCallback(() => {
    setDreams(INITIAL_DREAMS);
  }, []);

  const value = useMemo(
    () => ({
      dreams,
      addDream,
      updateDream,
      deleteDream,
      resetDreams,
      isLoaded,
    }),
    [addDream, deleteDream, dreams, isLoaded, resetDreams, updateDream]
  );

  return <DreamsContext.Provider value={value}>{children}</DreamsContext.Provider>;
}

export function useDreams() {
  const context = useContext(DreamsContext);
  if (!context) {
    throw new Error('useDreams must be used within a DreamsProvider');
  }
  return context;
}
