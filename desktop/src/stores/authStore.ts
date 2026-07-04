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
    // Kami membiarkan onAuthStateChange('INITIAL_SESSION') yang menangani fetch profile dan sesi
    // untuk mencegah race condition. Di sini kita cukup menambahkan fallback timeout 5 detik
    // untuk menghindari white screen jika listener macet.
    try {
      const waitHydration = new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (get().isHydrated) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

      await Promise.race([
        waitHydration,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Hydrate timeout")), 5000))
      ]);
    } catch (err) {
      console.error("Auth hydrate error:", err);
      if (!get().isHydrated) {
        set({ isHydrated: true });
      }
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
      
      // INITIAL_SESSION merespons instan dari cache lokal (sangat cepat)
      if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session?.user) {
        try {
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
          useAuthStore.setState({ isHydrated: true });
        } catch (e) {
          if (!mounted) return;
          store.setAuth({
            id: session.user.id,
            email: session.user.email ?? "",
            name: session.user.user_metadata?.name ?? "User",
            role: "PARENT",
            walletAddress: null,
          });
          useAuthStore.setState({ isHydrated: true });
        }
      } else if (event === "INITIAL_SESSION" && !session) {
        useAuthStore.setState({ isHydrated: true });
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
