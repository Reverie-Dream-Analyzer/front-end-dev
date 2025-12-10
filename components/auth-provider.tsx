'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import type { UserProfile, ZodiacSign } from '@/types/user-profile';

// Zodiac signs with date ranges for calculation
const zodiacSigns: Array<ZodiacSign & { range: { start: [number, number]; end: [number, number] } }> = [
  { sign: 'Aries', symbol: '♈', element: 'Fire', traits: ['Bold', 'Energetic', 'Independent'], dates: 'March 21 - April 19', range: { start: [3, 21], end: [4, 19] } },
  { sign: 'Taurus', symbol: '♉', element: 'Earth', traits: ['Reliable', 'Patient', 'Practical'], dates: 'April 20 - May 20', range: { start: [4, 20], end: [5, 20] } },
  { sign: 'Gemini', symbol: '♊', element: 'Air', traits: ['Curious', 'Adaptable', 'Expressive'], dates: 'May 21 - June 20', range: { start: [5, 21], end: [6, 20] } },
  { sign: 'Cancer', symbol: '♋', element: 'Water', traits: ['Nurturing', 'Intuitive', 'Protective'], dates: 'June 21 - July 22', range: { start: [6, 21], end: [7, 22] } },
  { sign: 'Leo', symbol: '♌', element: 'Fire', traits: ['Confident', 'Creative', 'Generous'], dates: 'July 23 - August 22', range: { start: [7, 23], end: [8, 22] } },
  { sign: 'Virgo', symbol: '♍', element: 'Earth', traits: ['Analytical', 'Helpful', 'Detail-oriented'], dates: 'August 23 - September 22', range: { start: [8, 23], end: [9, 22] } },
  { sign: 'Libra', symbol: '♎', element: 'Air', traits: ['Diplomatic', 'Balanced', 'Social'], dates: 'September 23 - October 22', range: { start: [9, 23], end: [10, 22] } },
  { sign: 'Scorpio', symbol: '♏', element: 'Water', traits: ['Intense', 'Passionate', 'Mysterious'], dates: 'October 23 - November 21', range: { start: [10, 23], end: [11, 21] } },
  { sign: 'Sagittarius', symbol: '♐', element: 'Fire', traits: ['Adventurous', 'Optimistic', 'Free-spirited'], dates: 'November 22 - December 21', range: { start: [11, 22], end: [12, 21] } },
  { sign: 'Capricorn', symbol: '♑', element: 'Earth', traits: ['Ambitious', 'Disciplined', 'Responsible'], dates: 'December 22 - January 19', range: { start: [12, 22], end: [1, 19] } },
  { sign: 'Aquarius', symbol: '♒', element: 'Air', traits: ['Independent', 'Innovative', 'Humanitarian'], dates: 'January 20 - February 18', range: { start: [1, 20], end: [2, 18] } },
  { sign: 'Pisces', symbol: '♓', element: 'Water', traits: ['Compassionate', 'Artistic', 'Intuitive'], dates: 'February 19 - March 20', range: { start: [2, 19], end: [3, 20] } },
];

function calculateZodiacSign(birthDate: string): ZodiacSign {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const zodiac of zodiacSigns) {
    const { start, end } = zodiac.range;

    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= start[1]) || (month === 1 && day <= end[1])) {
        return { sign: zodiac.sign, symbol: zodiac.symbol, element: zodiac.element, traits: zodiac.traits, dates: zodiac.dates };
      }
    } else if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1]) ||
      (month > start[0] && month < end[0])
    ) {
      return { sign: zodiac.sign, symbol: zodiac.symbol, element: zodiac.element, traits: zodiac.traits, dates: zodiac.dates };
    }
  }

  const aries = zodiacSigns[0];
  return { sign: aries.sign, symbol: aries.symbol, element: aries.element, traits: aries.traits, dates: aries.dates };
}

type AuthUser = {
  id?: string;
  email: string;
  hasProfile: boolean;
  profile: UserProfile | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (params: LoginParams) => void;
  logout: () => void;
  completeProfile: (profile: UserProfile) => void;
};

type LoginParams = {
  id?: string;
  email: string;
  token: string;
  requireProfileSetup?: boolean;
  backendProfile?: {
    has_profile: boolean;
    birthdate: string | null;
    favorite_element: string | null;
    dream_goals: string[];
  };
};

type StoredAuthPayload = {
  id?: string;
  email: string;
  hasProfile?: boolean;
  token?: string;
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
      id: storedUser.id,
      email: storedUser.email,
      hasProfile: storedUser.hasProfile ?? Boolean(profile),
      profile,
    };
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    const stored = readStoredAuth();
    return stored?.token ?? null;
  });

  const login = (params: LoginParams) => {
    const { id, email, token, requireProfileSetup, backendProfile } = params;
    if (!email || !token) {
      throw new Error('Email and token are required');
    }

    const profiles = readProfiles();
    let existingProfile = profiles[email] ?? null;
    
    // If we have backend profile data and user has a profile, construct UserProfile
    if (backendProfile?.has_profile && backendProfile.birthdate && backendProfile.favorite_element) {
      const zodiacSign = calculateZodiacSign(backendProfile.birthdate);
      // Capitalize element to match frontend format (fire -> Fire)
      const capitalizedElement = backendProfile.favorite_element.charAt(0).toUpperCase() + backendProfile.favorite_element.slice(1);
      existingProfile = {
        name: email.split('@')[0], // Use email prefix as name since backend doesn't store it
        birthday: backendProfile.birthdate,
        favoriteElement: capitalizedElement,
        dreamGoals: backendProfile.dream_goals || [],
        zodiacSign,
      };
      // Cache it in localStorage for future use
      profiles[email] = existingProfile;
      writeProfiles(profiles);
    }
    
    const hasProfile = requireProfileSetup ? false : (backendProfile?.has_profile ?? Boolean(existingProfile));

    const nextUser: AuthUser = {
      id,
      email,
      hasProfile,
      profile: hasProfile ? existingProfile : null,
    };

    setUser(nextUser);
    setAuthToken(token);
    writeStoredAuth({ id, email, hasProfile, token });
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
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
      writeStoredAuth({
        email: nextUser.email,
        hasProfile: true,
        ...(authToken ? { token: authToken } : {}),
      });

      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      token: authToken,
      login,
      logout,
      completeProfile,
    }),
    [authToken, completeProfile, login, logout, user]
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
