export type Role = 'PARENT' | 'MEDIC' | 'POSYANDU' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  walletAddress: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RefreshResponse = {
  accessToken: string;
};
