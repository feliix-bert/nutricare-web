import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

import type { User } from '@/features/auth/types/auth.types';

const ACCESS_TOKEN_KEY = 'tumbuh_access_token';
const REFRESH_TOKEN_KEY = 'tumbuh_refresh_token';

// ---------------------------------------------------------------------------
// Storage helpers (SecureStore on native, localStorage on web)
// ---------------------------------------------------------------------------

const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async delete(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
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
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    void storage.delete(ACCESS_TOKEN_KEY);
    void storage.delete(REFRESH_TOKEN_KEY);
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
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
