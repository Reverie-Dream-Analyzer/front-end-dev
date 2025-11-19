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
import * as dreamApi from '@/lib/api/dream';
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

  const auth = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);

    // If we have a logged in user with a token, try to fetch server-side dreams
    const tryLoadFromApi = async () => {
      const token = auth?.token ?? null;
      if (token) {
        try {
          const apiDreams = await dreamApi.getDreams(token);
          const mapped: Dream[] = apiDreams.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.dream_text ?? d.summary ?? '',
            date: d.submitted_at ?? new Date().toISOString(),
            mood: d.mood ?? 'neutral',
            tags: d.tags ?? [],
            lucidity: Boolean(d.is_lucid),
            analysis: d.summary ?? '',
          }));
          startTransition(() => {
            setDreams(mapped);
            setIsLoaded(true);
          });
          // persist to storage for offline use
          window.localStorage.setItem(storageKey, JSON.stringify(mapped));
          return;
        } catch (error) {
          // fallback to local storage on error
        }
      }

      // fallback: load from local storage or defaults
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
    };

    void tryLoadFromApi();
  }, [storageKey, auth?.token]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(dreams));
  }, [dreams, isLoaded, storageKey]);

  

  const addDream = useCallback(
    async (dream: Dream) => {
      setDreams((prev) => [dream, ...prev]);

      const token = auth?.token ?? null;
      if (!token) return;

      try {
        await dreamApi.createDream(
          {
            dreamText: dream.description,
            title: dream.title,
            is_lucid: dream.lucidity,
            tags: dream.tags,
            mood: dream.mood,
          },
          token
        );
      } catch (error) {
        console.warn('Failed to persist new dream to API', error);
      }
    },
    [auth]
  );

  const updateDream = useCallback(
    async (id: string, updates: Partial<Dream>) => {
      setDreams((prev) => prev.map((dream) => (dream.id === id ? { ...dream, ...updates } : dream)));

      const token = auth?.token ?? null;
      if (!token) return;

      try {
        await dreamApi.updateDream(id, {
          title: updates.title,
          dreamText: updates.description,
          is_lucid: updates.lucidity,
          tags: updates.tags,
          mood: updates.mood,
        }, token);
      } catch (error) {
        console.warn('Failed to update dream on API', error);
      }
    },
    [auth]
  );

  const deleteDream = useCallback(
    async (id: string) => {
      setDreams((prev) => prev.filter((dream) => dream.id !== id));

      const token = auth?.token ?? null;
      if (!token) return;

      try {
        await dreamApi.deleteDream(id, token);
      } catch (error) {
        console.warn('Failed to delete dream on API', error);
      }
    },
    [auth]
  );

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
