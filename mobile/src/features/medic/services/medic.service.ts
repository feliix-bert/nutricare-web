import { apiClient } from '@/services/api';
import { delay, USE_MOCK } from '@/services/mock';
import type { PageResponse } from '@/types/api.types';
import type { Patient } from '../types/medic.types';

// ── Transform helpers ────────────────────────────────────────────────────

type ServerPatientItem = Record<string, unknown>;

function toPatient(item: ServerPatientItem): Patient {
  const latestPrediction = item.latestPrediction as Record<string, unknown> | null;
  return {
    childId: (item.id as string) ?? '',
    childName: (item.name as string) ?? '',
    childAgeMonths: (item.ageMonths as number) ?? 0,
    lastAssessmentDate: latestPrediction?.createdAt as string | undefined,
    lastStatus: (latestPrediction?.status as Patient['lastStatus']) ?? undefined,
    parentId: '',
    parentName: (item.parentName as string) ?? '',
    hasActiveVc: false,
  };
}

const seedPatients: Patient[] = [
  { childId: 'child_001', childName: 'Andi Santoso', childAgeMonths: 18, lastAssessmentDate: '2024-01-15', lastStatus: 'AT_RISK', hasActiveVc: true, activeVcId: 'vc_001', parentId: 'user_001', parentName: 'Budi Santoso' },
  { childId: 'child_002', childName: 'Sari Dewi', childAgeMonths: 12, lastAssessmentDate: '2024-01-10', lastStatus: 'NORMAL', hasActiveVc: false, parentId: 'user_001', parentName: 'Budi Santoso' },
];

// ── Service ──────────────────────────────────────────────────────────────

export const medicService = {
  getPatients: async (page = 0, size = 10, search?: string, status?: string): Promise<{ data: Patient[] }> => {
    if (USE_MOCK) {
      await delay(400);
      return { data: seedPatients };
    }
    const res = await apiClient.get<PageResponse<ServerPatientItem>>('/api/medic/patients', {
      params: { page, size, search, status },
    });
    return { data: res.data.data.map(toPatient) };
  },
};
