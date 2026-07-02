"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function SupabaseAuthListener({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  // Hydrate on mount
  useEffect(() => {
    if (!useAuthStore.getState().isHydrated) {
      hydrate();
    }
  }, [hydrate]);

  // Listen to Supabase auth changes
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("role, wallet_address")
          .eq("id", session.user.id)
          .single();

        setAuth({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.name ?? "User",
          role: (profile?.role as "PARENT" | "MEDIC" | "POSYANDU" | "ADMIN") ?? "PARENT",
          walletAddress: profile?.wallet_address ?? null,
        });
      } else if (event === "SIGNED_OUT") {
        logout();
      } else if (event === "TOKEN_REFRESHED") {
        // Session refreshed — optionally re-hydrate
        hydrate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, logout, hydrate]);

  return children;
}
