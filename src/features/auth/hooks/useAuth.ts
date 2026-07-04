import { useRouter } from "next/navigation";
import { useState } from "react";

import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import type { LoginRequest, RegisterRequest } from "@/features/auth/types/auth.types";

type AuthError = { message: string } | null;

export const useAuth = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeLogout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError>(null);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setAuth(response.user);
      // Role-based redirect: MEDIC goes to doctor portal, others to home
      const destination = response.user.role === "MEDIC" ? "/medic" : "/";
      router.replace(destination);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
      setError({ message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Registrasi gagal. Coba lagi.";
      setError({ message: msg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    router.replace("/auth/sign-in");
  };

  return {
    login,
    register,
    logout,
    isLoading,
    error,
    isAuthenticated,
    isHydrated,
    user,
  };
};
