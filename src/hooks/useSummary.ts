import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api/summary';
import { queryKeys } from './queryKeys';

export function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.summary(from, to),
    queryFn: () => getSummary(from, to),
  });
}
