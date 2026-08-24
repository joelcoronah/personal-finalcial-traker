import type { CategoriesQuery, TransactionsQuery } from '../types';

/** Centraliza las query keys de React Query para invalidar cache de forma consistente. */
export const queryKeys = {
  rates: ['rates', 'today'] as const,
  transactions: (query?: TransactionsQuery) => ['transactions', query ?? {}] as const,
  transaction: (id: string) => ['transactions', id] as const,
  summary: (from: string, to: string) => ['summary', from, to] as const,
  categories: (query?: CategoriesQuery) => ['categories', query ?? {}] as const,
  budgetPlan: (month: string) => ['budget-plans', month] as const,
  budgetPlanProgress: (month: string) => ['budget-plans', month, 'progress'] as const,
};
