import { useQuery } from '@tanstack/react-query';
import { getDebt, getDebts } from '../api/debts';
import { queryKeys } from './queryKeys';
import type { DebtsQuery } from '../types';

export function useDebts(query: DebtsQuery = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.debts(query),
    queryFn: () => getDebts(query),
    enabled: options.enabled ?? true,
  });
}

export function useDebt(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.debt(id ?? ''),
    queryFn: () => getDebt(id as string),
    enabled: Boolean(id),
  });
}
