import { useQuery } from '@tanstack/react-query';
import { fetchInterviewHistory } from '../services/history.service';

export function useHasScoredSession() {
  return useQuery({
    queryKey: ['practice', 'has-scored-session'],
    queryFn: async () => {
      const result = await fetchInterviewHistory({
        page: 1,
        pageSize: 1,
        status: 'Scored',
        excludeCampaign: true,
      });
      return result.interviews.length > 0;
    },
    staleTime: 60_000,
  });
}
