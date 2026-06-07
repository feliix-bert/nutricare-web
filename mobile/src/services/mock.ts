import type { AuthResponse, User } from '@/features/auth/types/auth.types';
import type { Child } from '@/features/children/types/child.types';

export const USE_MOCK = true;

/** Simulates network latency */
export const delay = (ms = 600) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

type MockUser = User & { password: string };

let mockUsers: MockUser[] = [
  {
    id: 'user_001',
    email: 'orang.tua@email.com',
    password: 'password123',
    name: 'Budi Santoso',
    role: 'PARENT',
    walletAddress: null,
  },
];

let mockChildren: Child[] = [
  {
    id: 'child_001',
    name: 'Andi Santoso',
    birthDate: '2023-01-15',
    gender: 'MALE',
    ageMonths: 18,
    latestPrediction: { status: 'AT_RISK', createdAt: '2025-07-01T00:00:00Z' },
  },
  {
    id: 'child_002',
    name: 'Sari Dewi',
    birthDate: '2024-03-10',
    gender: 'FEMALE',
    ageMonths: 6,
    latestPrediction: { status: 'NORMAL', createdAt: '2025-07-10T00:00:00Z' },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fake token — just base64 JSON, NOT a real JWT */
export const makeFakeToken = (payload: object, prefix = 'access') =>
  `${prefix}.${btoa(JSON.stringify(payload))}.fakesig`;

export const findUserByEmail = (email: string) =>
  mockUsers.find((u) => u.email === email);

export const addMockUser = (user: MockUser) => {
  mockUsers.push(user);
};

export const getMockChildren = () => [...mockChildren];

export const addMockChild = (child: Child) => {
  mockChildren.push(child);
};

export const updateMockChild = (id: string, updates: Partial<Child>) => {
  mockChildren = mockChildren.map((c) =>
    c.id === id ? { ...c, ...updates } : c,
  );
  return mockChildren.find((c) => c.id === id);
};

export const buildMockAuthResponse = (user: User): AuthResponse => ({
  accessToken: makeFakeToken({ sub: user.id, role: user.role, exp: Date.now() + 86400000 }),
  refreshToken: makeFakeToken({ sub: user.id }, 'refresh'),
  user,
});
