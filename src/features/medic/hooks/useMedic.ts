import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPatients, fetchPatientSummary, issueVc, revokeVc } from '../services/medic.service';
import type { IssueVcPayload, RevokeVcPayload } from '../types/medic.types';

export const usePatients = (page = 0, size = 10, search = '', status = 'ALL') => {
  return useQuery({
    queryKey: ['medic-patients', page, size, search, status],
    queryFn: () => fetchPatients(page, size, search, status),
  });
};

export const usePatientSummary = (childId: string) => {
  return useQuery({
    queryKey: ['medic-patient-summary', childId],
    queryFn: () => fetchPatientSummary(childId),
    enabled: !!childId,
  });
};

export const useIssueVc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IssueVcPayload) => issueVc(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
    },
  });
};

export const useRevokeVc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RevokeVcPayload) => revokeVc(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
    },
  });
};
