import { create } from 'zustand';

import type { User } from '@/features/auth/types/auth.types';

const ACCESS_TOKEN_KEY = 'tumbuh_access_token';
const REFRESH_TOKEN_KEY = 'tumbuh_refresh_token';
const USER_DATA_KEY = 'tumbuh_user_data';

// ---------------------------------------------------------------------------
// Storage helpers (localStorage on web)
// ---------------------------------------------------------------------------

const storage = {
  async get(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async set(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async delete(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** True until the initial hydration from SecureStore completes */
  isHydrated: boolean;
  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (accessToken, refreshToken, user) => {
    // Persist asynchronously — fire and forget
    void storage.set(ACCESS_TOKEN_KEY, accessToken);
    void storage.set(REFRESH_TOKEN_KEY, refreshToken);
    void storage.set(USER_DATA_KEY, JSON.stringify(user));
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  setUser: (user) => {
    void storage.set(USER_DATA_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    void storage.delete(ACCESS_TOKEN_KEY);
    void storage.delete(REFRESH_TOKEN_KEY);
    void storage.delete(USER_DATA_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    const accessToken = await storage.get(ACCESS_TOKEN_KEY);
    const refreshToken = await storage.get(REFRESH_TOKEN_KEY);
    const userDataStr = await storage.get(USER_DATA_KEY);
    
    let user = null;
    if (userDataStr) {
      try {
        user = JSON.parse(userDataStr);
      } catch (e) {
        console.error("Failed to parse user data from storage", e);
      }
    }

    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, user, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
