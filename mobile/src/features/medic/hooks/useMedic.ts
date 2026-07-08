import { useQuery } from '@tanstack/react-query';
import { medicService } from '../services/medic-service';

export const useMedicPatients = () => {
  return useQuery({
    queryKey: ['medicPatients'],
    queryFn: () => medicService.getPatients(),
  });
};

export const usePatients = useMedicPatients;

export const useConversations = () => {
  return useQuery({
    queryKey: ['medicConversations'],
    queryFn: () => medicService.getConversations(),
    refetchInterval: 10_000,
  });
};

// Re-export VC hooks for convenience
export { useIssueVc, useRevokeVc } from '@/features/vc/hooks/useVC';
