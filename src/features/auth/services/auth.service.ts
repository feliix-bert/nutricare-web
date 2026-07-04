import { createClient } from "@/lib/supabase/client";

import type { LoginRequest, RegisterRequest, AuthResponse, User } from "@/features/auth/types/auth.types";
import type { RoleEnum } from "@/types/supabase";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mapSupabaseUser = (supaUser: { id: string; email?: string | null; user_metadata?: { name?: string } }): User => ({
  id: supaUser.id,
  email: supaUser.email ?? "",
  name: supaUser.user_metadata?.name ?? "User",
  role: "PARENT" as RoleEnum,
  walletAddress: null,
});

// ---------------------------------------------------------------------------
// Auth service — via Supabase Auth
// ---------------------------------------------------------------------------

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.session) throw new Error("No session returned");

    const user = mapSupabaseUser(authData.user);

    // Fetch profile from public.users for role & walletAddress
    const { data: profile } = await supabase
      .from("users")
      .select("role, wallet_address")
      .eq("id", authData.user.id)
      .single();

    if (profile) {
      user.role = profile.role as RoleEnum;
      user.walletAddress = profile.wallet_address;
    }

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user,
    };
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("No user returned");

    return mapSupabaseUser(authData.user);
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) throw new Error("Session refresh failed");

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  getMe: async (): Promise<User> => {
    const supabase = createClient();
    const { data: { user: supaUser }, error } = await supabase.auth.getUser();

    if (error || !supaUser) throw new Error("Not authenticated");

    const user = mapSupabaseUser(supaUser);

    const { data: profile } = await supabase
      .from("users")
      .select("role, wallet_address")
      .eq("id", supaUser.id)
      .single();

    if (profile) {
      user.role = profile.role as RoleEnum;
      user.walletAddress = profile.wallet_address;
    }

    return user;
  },
};
