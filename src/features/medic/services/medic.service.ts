import { apiClient } from '@/services/api';
import type { PaginatedPatients, IssueVcPayload, RevokeVcPayload } from '../types/medic.types';

export const fetchPatients = async (
  page = 0,
  size = 10,
  search = '',
  status = 'ALL'
): Promise<PaginatedPatients> => {
  const params: Record<string, any> = { page, size };
  if (search) params.search = search;
  if (status !== 'ALL') params.status = status;

  const res = await apiClient.get('/api/medic/patients', { params });
  
  // Transform dynamic Map to Patient array
  const rawData = res.data.data || [];
  const transformedData = rawData.map((p: any) => ({
    childId: p.id,
    childName: p.name,
    gender: p.gender,
    birthDate: p.birthDate,
    ageMonths: p.ageMonths,
    parentName: p.parentName || p.parent?.name || 'Unknown',
    lastStatus: p.latestPrediction?.status || 'NORMAL',
    lastAssessmentDate: p.latestPrediction?.createdAt || null,
    // Add activeVcId logic if present in your dynamic map (optional)
    activeVcId: null,
    vcStatus: null,
  }));

  return {
    ...res.data,
    data: transformedData,
  };
};

export const fetchPatientSummary = async (childId: string) => {
  const res = await apiClient.get(`/api/medic/patients/${childId}/summary`);
  return res.data;
};

export const issueVc = async (payload: IssueVcPayload) => {
  const res = await apiClient.post('/api/vc/issue', payload);
  return res.data;
};

export const revokeVc = async (payload: RevokeVcPayload) => {
  const res = await apiClient.post('/api/vc/revoke', payload);
  return res.data;
};
