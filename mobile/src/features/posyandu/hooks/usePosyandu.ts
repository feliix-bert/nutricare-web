import { useQuery } from '@tanstack/react-query';
import { posyanduService } from '../services/posyandu-service';

export const usePosyanduSessions = () => {
  return useQuery({
    queryKey: ['posyanduSessions'],
    queryFn: posyanduService.getSessions,
  });
};
