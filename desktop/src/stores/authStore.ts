import { create } from "zustand";
import { useEffect } from "react";

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user) => {
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return; // Prevent infinite loop on SIGNED_OUT event

    const supabase = createClient();
    supabase.auth.signOut();
    // Hapus cookies langsung biar proxy.ts ga detek session lama
    document.cookie.split("; ").filter(c => c.includes("sb-")).forEach(c => {
      const name = c.split("=")[0];
      document.cookie = `${name}=; path=/; max-age=0`;
      document.cookie = `${name}=; path=/; max-age=0; domain=${window.location.hostname}`;
    });
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        let role: User["role"] = "PARENT";
        let walletAddress: string | null = null;

        try {
          const { data: profile } = await supabase
            .from("users")
            .select("role, wallet_address")
            .eq("id", data.session.user.id)
            .single();
          if (profile) {
            role = profile.role as User["role"];
            walletAddress = profile.wallet_address;
          }
        } catch {
          // Profile fetch optional — fallback ke default
        }

        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          name: data.session.user.user_metadata?.name ?? "User",
          role,
          walletAddress,
        };

        set({ user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (err) {
      console.error("Auth hydrate error:", err);
      set({ isHydrated: true }); // tetap set biar ga white screen
    }
  },
}));

export function useAuthHydration() {
  useEffect(() => {
    const store = useAuthStore.getState();
    let mounted = true;

    // 1. Kick off hydration immediately when component mounts
    store.hydrate();

    // 2. Setup auth state listener independently of React lifecycle
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("role, wallet_address")
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;
        store.setAuth({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.name ?? "User",
          role: (profile?.role as "PARENT" | "MEDIC" | "POSYANDU" | "ADMIN") ?? "PARENT",
          walletAddress: profile?.wallet_address ?? null,
        });
      } else if (event === "SIGNED_OUT") {
        store.logout();
      } else if (event === "TOKEN_REFRESHED") {
        store.hydrate();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
}
