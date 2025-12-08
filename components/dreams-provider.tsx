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

// Key for tracking pending local edits that haven't synced to server yet
const getPendingEditsKey = (email: string | undefined) =>
  email ? `reverie_pending_edits_${email}` : 'reverie_pending_edits_guest';

export function DreamsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => getStorageKey(user?.email), [user?.email]);
  const pendingEditsKey = useMemo(() => getPendingEditsKey(user?.email), [user?.email]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const auth = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);

    // STEP 1: Load from localStorage IMMEDIATELY for instant display
    if (stored) {
      try {
        const parsed: Dream[] = JSON.parse(stored);
        startTransition(() => {
          setDreams(parsed);
          setIsLoaded(true);
        });
      } catch (error) {
        console.warn('Unable to parse stored dreams', error);
        startTransition(() => {
          setIsLoaded(true);
        });
      }
    } else {
      startTransition(() => {
        setIsLoaded(true);
      });
    }

    // STEP 2: Sync from API in background (won't block UI)
    const syncFromApi = async () => {
      const token = auth?.token ?? null;
      if (!token) return;

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

        // Get pending edits that haven't synced yet
        const pendingEditsRaw = window.localStorage.getItem(pendingEditsKey);
        const pendingEdits: Record<string, Dream> = pendingEditsRaw 
          ? JSON.parse(pendingEditsRaw) 
          : {};

        // Get pending deletes that haven't synced yet
        const pendingDeletesKey = `reverie_pending_deletes_${user?.email || 'guest'}`;
        const pendingDeletesRaw = window.localStorage.getItem(pendingDeletesKey);
        const pendingDeletes: string[] = pendingDeletesRaw 
          ? JSON.parse(pendingDeletesRaw) 
          : [];
        const pendingDeletesSet = new Set(pendingDeletes);

        // Filter out deleted dreams, then merge with pending edits
        const mergedDreams = mapped
          .filter((apiDream) => !pendingDeletesSet.has(apiDream.id))
          .map((apiDream) => {
            if (pendingEdits[apiDream.id]) {
              // Local edit exists - use it instead of API version
              return pendingEdits[apiDream.id];
            }
            return apiDream;
          });

        // Add any locally-created dreams that don't exist in API yet (and aren't deleted)
        const apiIds = new Set(mapped.map(d => d.id));
        const localOnlyDreams = Object.values(pendingEdits).filter(
          (d) => !apiIds.has(d.id) && !pendingDeletesSet.has(d.id)
        );

        const finalDreams = [...localOnlyDreams, ...mergedDreams];

        startTransition(() => {
          setDreams(finalDreams);
        });
        
        // Update localStorage with merged data
        window.localStorage.setItem(storageKey, JSON.stringify(finalDreams));
      } catch (error) {
        console.warn('Failed to sync dreams from API, using local cache', error);
      }
    };

    void syncFromApi();
  }, [storageKey, pendingEditsKey, auth?.token, user?.email]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(dreams));
  }, [dreams, isLoaded, storageKey]);

  

  const addDream = useCallback(
    async (dream: Dream) => {
      // Add dream with temporary ID first for instant UI update
      const tempId = dream.id;
      setDreams((prev) => [dream, ...prev]);

      const token = auth?.token ?? null;
      if (!token) return;

      try {
        const response = await dreamApi.createDream(
          {
            dreamText: dream.description,
            title: dream.title,
            is_lucid: dream.lucidity,
            tags: dream.tags,
            mood: dream.mood,
          },
          token
        );
        
        // Update the dream with the real database ID
        if (response && response.dream_id) {
          setDreams((prev) => 
            prev.map((d) => 
              d.id === tempId ? { ...d, id: response.dream_id } : d
            )
          );
        }
      } catch (error) {
        console.warn('Failed to persist new dream to API', error);
      }
    },
    [auth]
  );

  const updateDream = useCallback(
    async (id: string, updates: Partial<Dream>) => {
      // Update UI immediately
      let updatedDream: Dream | null = null;
      setDreams((prev) => prev.map((dream) => {
        if (dream.id === id) {
          updatedDream = { ...dream, ...updates };
          return updatedDream;
        }
        return dream;
      }));

      // Track this edit as pending until API confirms
      if (updatedDream && typeof window !== 'undefined') {
        const pendingEditsRaw = window.localStorage.getItem(pendingEditsKey);
        const pendingEdits: Record<string, Dream> = pendingEditsRaw 
          ? JSON.parse(pendingEditsRaw) 
          : {};
        pendingEdits[id] = updatedDream;
        window.localStorage.setItem(pendingEditsKey, JSON.stringify(pendingEdits));
      }

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

        // API succeeded - remove from pending edits
        if (typeof window !== 'undefined') {
          const pendingEditsRaw = window.localStorage.getItem(pendingEditsKey);
          const pendingEdits: Record<string, Dream> = pendingEditsRaw 
            ? JSON.parse(pendingEditsRaw) 
            : {};
          delete pendingEdits[id];
          window.localStorage.setItem(pendingEditsKey, JSON.stringify(pendingEdits));
        }
      } catch (error) {
        console.warn('Failed to update dream on API', error);
        // Keep in pending edits so it persists on refresh
      }
    },
    [auth, pendingEditsKey]
  );

  const deleteDream = useCallback(
    async (id: string) => {
      // Update UI immediately
      setDreams((prev) => prev.filter((dream) => dream.id !== id));

      // Track this delete as pending
      if (typeof window !== 'undefined') {
        const pendingDeletesKey = `reverie_pending_deletes_${user?.email || 'guest'}`;
        const pendingDeletesRaw = window.localStorage.getItem(pendingDeletesKey);
        const pendingDeletes: string[] = pendingDeletesRaw 
          ? JSON.parse(pendingDeletesRaw) 
          : [];
        pendingDeletes.push(id);
        window.localStorage.setItem(pendingDeletesKey, JSON.stringify(pendingDeletes));

        // Also remove from pending edits if it was there
        const pendingEditsRaw = window.localStorage.getItem(pendingEditsKey);
        const pendingEdits: Record<string, Dream> = pendingEditsRaw 
          ? JSON.parse(pendingEditsRaw) 
          : {};
        delete pendingEdits[id];
        window.localStorage.setItem(pendingEditsKey, JSON.stringify(pendingEdits));
      }

      const token = auth?.token ?? null;
      if (!token) return;

      try {
        await dreamApi.deleteDream(id, token);

        // API succeeded - remove from pending deletes
        if (typeof window !== 'undefined') {
          const pendingDeletesKey = `reverie_pending_deletes_${user?.email || 'guest'}`;
          const pendingDeletesRaw = window.localStorage.getItem(pendingDeletesKey);
          const pendingDeletes: string[] = pendingDeletesRaw 
            ? JSON.parse(pendingDeletesRaw) 
            : [];
          const updated = pendingDeletes.filter((did) => did !== id);
          window.localStorage.setItem(pendingDeletesKey, JSON.stringify(updated));
        }
      } catch (error) {
        console.warn('Failed to delete dream on API', error);
        // Keep in pending deletes so it stays deleted on refresh
      }
    },
    [auth, pendingEditsKey, user?.email]
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
