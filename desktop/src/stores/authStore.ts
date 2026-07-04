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
    // We handle initial hydration explicitly in useAuthHydration.
    // This is just a fallback for TOKEN_REFRESHED if we ever need it.
  },
}));

export function useAuthHydration() {
  useEffect(() => {
    const store = useAuthStore.getState();
    let mounted = true;

    const supabase = createClient();

    // 1. Manually fetch the current session to ensure hydration completes
    const initSession = async () => {
      console.log("[Auth] Fetching session manually for hydration...");
      try {
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeout = new Promise((_, reject) => 
           setTimeout(() => reject(new Error("getSession timeout")), 5000)
        );
        
        const { data: { session }, error } = (await Promise.race([
           sessionPromise, 
           sessionTimeout
        ])) as any;
        
        if (error) {
           console.error("[Auth] getSession error:", error);
           if (mounted) useAuthStore.setState({ isHydrated: true });
           return;
        }

        if (session?.user) {
          console.log("[Auth] Session found, fetching profile...");
          try {
            // Add a timeout to the profile fetch just in case it hangs
            const profilePromise = supabase
              .from("users")
              .select("role, wallet_address")
              .eq("id", session.user.id)
              .single();
              
            const timeoutPromise = new Promise((_, reject) => 
               setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
            );

            const { data: profile, error: profileError } = (await Promise.race([
               profilePromise, 
               timeoutPromise
            ])) as any;

            console.log(`[Auth] Profile fetch result. Error: ${profileError?.message}`);

            if (mounted) {
              store.setAuth({
                id: session.user.id,
                email: session.user.email ?? "",
                name: session.user.user_metadata?.name ?? "User",
                role: (profile?.role as "PARENT" | "MEDIC" | "POSYANDU" | "ADMIN") ?? "PARENT",
                walletAddress: profile?.wallet_address ?? null,
              });
              useAuthStore.setState({ isHydrated: true });
            }
          } catch (e) {
            console.error("[Auth] Profile fetch exception:", e);
            if (mounted) {
              // Fallback to basic parent if profile fetch fails
              store.setAuth({
                id: session.user.id,
                email: session.user.email ?? "",
                name: session.user.user_metadata?.name ?? "User",
                role: "PARENT",
                walletAddress: null,
              });
              useAuthStore.setState({ isHydrated: true });
            }
          }
        } else {
          console.log("[Auth] No session found.");
          if (mounted) {
            useAuthStore.setState({ isHydrated: true });
          }
        }
      } catch (err) {
        console.error("[Auth] Fatal error during initSession:", err);
        if (mounted) {
          useAuthStore.setState({ isHydrated: true });
        }
      }
    };

    initSession();

    // 2. Listen for future auth changes (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] onAuthStateChange event: ${event}`);
      if (!mounted) return;
      
      if (event === "SIGNED_IN" && session?.user) {
        // Handle login manually if needed, or rely on page redirect
        initSession(); 
      } else if (event === "SIGNED_OUT") {
        store.logout();
      } else if (event === "TOKEN_REFRESHED") {
        // Just re-fetch profile if token refreshed
        initSession();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
}
