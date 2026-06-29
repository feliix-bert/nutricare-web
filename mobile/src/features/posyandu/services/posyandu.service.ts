import { delay, USE_MOCK } from '@/services/mock';
import type { PosyanduSession } from '../types/posyandu.types';

const seedSessions: PosyanduSession[] = [
  { id: 'pos_001', date: '2026-07-01', location: 'Posyandu Melati', posyanduName: 'Melati', status: 'SCHEDULED', registeredChildren: 0 },
  { id: 'pos_002', date: '2026-06-15', location: 'Posyandu Mawar', posyanduName: 'Mawar', status: 'COMPLETED', registeredChildren: 12 },
];

export const posyanduService = {
  getSessions: async (): Promise<PosyanduSession[]> => {
    await delay(400);
    if (USE_MOCK) return seedSessions;
    // Server belum punya endpoint /api/posyandu/**
    return seedSessions;
  },
};
