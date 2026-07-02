import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@/features/auth/types/auth.types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user) => {
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      // Fetch profile from public.users for role & walletAddress
      const { data: profile } = await supabase
        .from("users")
        .select("role, wallet_address")
        .eq("id", data.session.user.id)
        .single();

      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email ?? "",
        name: data.session.user.user_metadata?.name ?? "User",
        role: (profile?.role as User["role"]) ?? "PARENT",
        walletAddress: profile?.wallet_address ?? null,
      };

      set({ user, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
