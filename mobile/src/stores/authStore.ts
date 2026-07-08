import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { authService } from '@/features/auth/services/auth-service';
import type { User } from '@/features/auth/types/auth-types';

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: (session) => {
    set({ session, isAuthenticated: !!session });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = await authService.getMe();
        set({ session, user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },
}));
