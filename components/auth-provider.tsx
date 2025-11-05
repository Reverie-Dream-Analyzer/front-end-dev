'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import type { UserProfile } from '@/types/user-profile';

type AuthUser = {
  email: string;
  hasProfile: boolean;
  profile: UserProfile | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: { requireProfileSetup?: boolean }) => void;
  logout: () => void;
  completeProfile: (profile: UserProfile) => void;
};

type StoredAuthPayload = {
  email: string;
  hasProfile?: boolean;
};

type ProfileStore = Record<string, UserProfile>;

const AUTH_STORAGE_KEY = 'reverie-auth-user';
const PROFILE_STORAGE_KEY = 'reverie-user-profiles';
const SHOULD_PERSIST_AUTH = true;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): StoredAuthPayload | null {
  if (!SHOULD_PERSIST_AUTH || typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: StoredAuthPayload = JSON.parse(raw);
    if (parsed?.email) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return null;
}

function readProfiles(): ProfileStore {
  if (!SHOULD_PERSIST_AUTH || typeof window === 'undefined') {
    return {};
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed: ProfileStore = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  }

  return {};
}

function writeStoredAuth(payload: StoredAuthPayload) {
  if (!SHOULD_PERSIST_AUTH || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

function writeProfiles(store: ProfileStore) {
  if (!SHOULD_PERSIST_AUTH || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(store));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!SHOULD_PERSIST_AUTH || typeof window === 'undefined') {
      return null;
    }

    const storedUser = readStoredAuth();
    if (!storedUser?.email) {
      return null;
    }

    const profiles = readProfiles();
    const profile = profiles[storedUser.email] ?? null;

    return {
      email: storedUser.email,
      hasProfile: storedUser.hasProfile ?? Boolean(profile),
      profile,
    };
  });

  const login = (email: string, password: string, options?: { requireProfileSetup?: boolean }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const profiles = readProfiles();
    const existingProfile = profiles[email] ?? null;
    const hasProfile = options?.requireProfileSetup ? false : Boolean(existingProfile);

    const nextUser: AuthUser = {
      email,
      hasProfile,
      profile: hasProfile ? existingProfile : null,
    };

    setUser(nextUser);
    writeStoredAuth({ email, hasProfile });
  };

  const logout = () => {
    setUser(null);
    if (SHOULD_PERSIST_AUTH && typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const completeProfile = (profile: UserProfile) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const nextUser: AuthUser = {
        ...prev,
        hasProfile: true,
        profile,
      };

      const profiles = readProfiles();
      profiles[nextUser.email] = profile;
      writeProfiles(profiles);
      writeStoredAuth({ email: nextUser.email, hasProfile: true });

      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      completeProfile,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
