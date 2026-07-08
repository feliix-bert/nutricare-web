import { router } from 'expo-router';
import { useState } from 'react';

import { authService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth-types';

type AuthError = { message: string } | null;

export const useAuth = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
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
      const result = await authService.login(data);
      if (result.user) setUser(result.user);
      if (result.session) setSession(result.session);
      router.replace('/(app)/(tabs)/' as never);
    } catch (err) {
      const msg = (err as Error)?.message ?? 'Terjadi kesalahan. Coba lagi.';
      setError({ message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(data);
      if (result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
      }
      return true;
    } catch (err) {
      const msg = (err as Error)?.message ?? 'Registrasi gagal. Coba lagi.';
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
