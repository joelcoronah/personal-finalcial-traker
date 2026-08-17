import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTransaction, getTransactions } from '../api/transactions';
import { queryKeys } from './queryKeys';
import type { TransactionsQuery } from '../types';

export function useTransactions(query: TransactionsQuery) {
  return useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () => getTransactions(query),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transaction(id ?? ''),
    queryFn: () => getTransaction(id as string),
    enabled: Boolean(id),
  });
}

/** Últimas N transacciones, para el dashboard. */
export function useRecentTransactions(limit = 8) {
  return useQuery({
    queryKey: queryKeys.transactions({ page: 1, limit }),
    queryFn: () => getTransactions({ page: 1, limit }),
  });
}
