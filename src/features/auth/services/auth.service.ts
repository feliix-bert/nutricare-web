import { apiClient } from '@/services/api';
import { USE_MOCK } from '@/services/mock';

import type {
  AuthResponse,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
  User,
} from '@/features/auth/types/auth.types';

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const mockLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  // Sesuai ARCHITECTURE.md: auth selalu melalui Spring Boot agar JWT valid.
  // JWT nyata diperlukan untuk semua endpoint terproteksi (termasuk /api/chat).
  const res = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return res.data;
};


const mockRegister = async (data: RegisterRequest): Promise<User> => {
  // Sesuai ARCHITECTURE.md: register harus ke Spring Boot agar user tersimpan di DB.
  // User yang hanya ada di mock store tidak bisa login karena mockLogin meneruskan ke Spring Boot.
  const res = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return res.data.user;
};

const mockRefreshToken = async (token: string): Promise<RefreshResponse> => {
  // Sesuai ARCHITECTURE.md: semua auth melalui Spring Boot
  const res = await apiClient.post<RefreshResponse>('/api/auth/refresh', {
    refreshToken: token,
  });
  return res.data;
};

const mockGetMe = async (): Promise<User> => {
  // Sesuai ARCHITECTURE.md: semua auth melalui Spring Boot
  const res = await apiClient.get<User>('/api/auth/me');
  return res.data;
};

// ---------------------------------------------------------------------------
// Real implementations
// ---------------------------------------------------------------------------

const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return res.data;
};

const realRegister = async (data: RegisterRequest): Promise<User> => {
  // Spring Boot register mengembalikan AuthResponse, bukan User secara langsung
  const res = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return res.data.user;
};

const realRefreshToken = async (token: string): Promise<RefreshResponse> => {
  const res = await apiClient.post<RefreshResponse>('/api/auth/refresh', {
    refreshToken: token,
  });
  return res.data;
};

const realGetMe = async (): Promise<User> => {
  const res = await apiClient.get<User>('/api/auth/me');
  return res.data;
};

// ---------------------------------------------------------------------------
// Exports — toggle between mock and real via USE_MOCK flag
// ---------------------------------------------------------------------------

export const authService = {
  login: USE_MOCK ? mockLogin : realLogin,
  register: USE_MOCK ? mockRegister : realRegister,
  refreshToken: USE_MOCK ? mockRefreshToken : realRefreshToken,
  getMe: USE_MOCK ? mockGetMe : realGetMe,
};
