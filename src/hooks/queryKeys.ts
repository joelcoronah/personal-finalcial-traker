import type { TransactionsQuery } from '../types';

/** Centraliza las query keys de React Query para invalidar cache de forma consistente. */
export const queryKeys = {
  rates: ['rates', 'today'] as const,
  transactions: (query?: TransactionsQuery) => ['transactions', query ?? {}] as const,
  transaction: (id: string) => ['transactions', id] as const,
  summary: (from: string, to: string) => ['summary', from, to] as const,
};
