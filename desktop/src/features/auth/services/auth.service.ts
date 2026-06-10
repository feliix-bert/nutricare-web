import { apiClient } from '@/services/api';
import {
  addMockUser,
  buildMockAuthResponse,
  delay,
  findUserByEmail,
  makeFakeToken,
  USE_MOCK,
} from '@/services/mock';
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
  await delay();
  const user = findUserByEmail(data.email);
  if (!user || user.password !== data.password) {
    throw { response: { status: 401, data: { message: 'Email atau password salah.' } } };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safeUser } = user;
  return buildMockAuthResponse(safeUser);
};

const mockRegister = async (data: RegisterRequest): Promise<User> => {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
};

const mockRefreshToken = async (token: string): Promise<RefreshResponse> => {
  await delay(300);
  // In mock mode the token is always "valid"
  const fakePayload = { sub: 'user_001', role: 'PARENT', exp: Date.now() + 86400000 };
  void token; // suppress unused warning
  return { accessToken: makeFakeToken(fakePayload) };
};

const mockGetMe = async (): Promise<User> => {
  await delay(300);
  const user = findUserByEmail('orang.tua@email.com');
  if (!user) throw new Error('Not found');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safeUser } = user;
  return safeUser;
};

// ---------------------------------------------------------------------------
// Real implementations
// ---------------------------------------------------------------------------

const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return res.data;
};

const realRegister = async (data: RegisterRequest): Promise<User> => {
  const res = await apiClient.post<User>('/api/auth/register', data);
  return res.data;
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
