import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vcService } from '../services/vc-service';

const VC_QUERY_KEY = 'vc';

export const useVcStatus = (childId: string) => {
  const { data: vc, isLoading } = useQuery({
    queryKey: [VC_QUERY_KEY, 'status', childId],
    queryFn: () => vcService.getVcStatus(childId),
    enabled: !!childId,
  });
  return { vc, hasActiveVc: vc?.status === 'ACTIVE', isLoading };
};

export const useVcDetail = (vcId: string) => {
  return useQuery({
    queryKey: [VC_QUERY_KEY, 'detail', vcId],
    queryFn: () => vcService.getVcDetail(vcId),
    enabled: !!vcId,
  });
};

export const useVerifyVc = () => useMutation({ mutationFn: vcService.verifyVc });

export const useIssueVc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vcService.issueVc,
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: [VC_QUERY_KEY, 'status', v.childId] }),
  });
};

export const useRevokeVc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vcService.revokeVc,
    onSuccess: () => qc.invalidateQueries({ queryKey: [VC_QUERY_KEY] }),
  });
};
