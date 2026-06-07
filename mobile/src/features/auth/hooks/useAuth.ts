import { router } from 'expo-router';
import { useState } from 'react';

import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

type AuthError = { message: string } | null;

export const useAuth = () => {
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
      setAuth(response.accessToken, response.refreshToken, response.user);
      router.replace('/(app)/(tabs)/' as never);
    } catch (err) {
      const msg =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.';
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ?? 'Registrasi gagal. Coba lagi.';
      setError({ message: msg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    router.replace('/sign-in');
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
