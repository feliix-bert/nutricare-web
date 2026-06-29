import { apiClient } from '@/services/api';
import {
  addMockUser,
  buildMockAuthResponse,
  delay,
  findUserByEmail,
  USE_MOCK,
} from '@/services/mock';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/features/auth/types/auth.types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay();
      const user = findUserByEmail(data.email);
      if (!user || user.password !== data.password) {
        throw { response: { status: 401, data: { message: 'Email atau password salah.' } } };
      }
      const { password: _pw, ...safeUser } = user;
      return buildMockAuthResponse(safeUser);
    }
    const res = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay();
      if (findUserByEmail(data.email)) {
        throw { response: { status: 409, data: { message: 'Email sudah terdaftar.' } } };
      }
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'PARENT',
        walletAddress: null,
      };
      addMockUser(newUser);
      const { password: _pw, ...safeUser } = newUser;
      return buildMockAuthResponse(safeUser);
    }
    const res = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  refreshToken: async (token: string): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay(300);
      const user = findUserByEmail('orang.tua@email.com');
      const safeUser = user
        ? (() => { const { password: _pw, ...u } = user; return u; })()
        : { id: 'user_001', email: 'orang.tua@email.com', name: 'Budi Santoso', role: 'PARENT' as const, isActive: true, walletAddress: null };
      return buildMockAuthResponse(safeUser);
    }
    const res = await apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken: token });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(300);
      const user = findUserByEmail('orang.tua@email.com');
      if (!user) throw new Error('Not found');
      const { password: _pw, ...safeUser } = user;
      return safeUser;
    }
    const res = await apiClient.get<User>('/api/auth/me');
    return res.data;
  },
};
